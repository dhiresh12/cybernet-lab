class LabEngine {
  constructor() {
    this.labs = new Map();
    this.activeSessions = new Map();
    this.postgres = null;
    this.redis = null;
    this.deviceManager = null;
  }

  initialize(postgres, redis, deviceManager, labs) {
    this.postgres = postgres;
    this.redis = redis;
    this.deviceManager = deviceManager;
    this.labs = labs;
  }

  async getState() {
    const sessions = await this.postgres.query('SELECT * FROM lab_sessions WHERE status = $1 LIMIT 10', ['active']);
    const devices = this.deviceManager.getAllDevices();
    return {
      activeSessions: sessions.rows.length,
      devices: devices.length,
      sessions: sessions.rows
    };
  }

async startLab(labId, userId) {
     const sessionId = `session_${Date.now()}_${userId}`;
     const result = await this.postgres.query(
       'INSERT INTO lab_sessions (lab_id, user_id, status) VALUES ($1, $2, $3) RETURNING id',
       [labId, userId, 'active']
     );
     
     const dbSessionId = result.rows[0].id;
     const session = {
       id: dbSessionId,
       labId,
       userId,
       startedAt: Date.now(),
       status: 'active'
     };
     
     this.activeSessions.set(sessionId, session);
     await this.redis.set(`lab:session:${sessionId}`, session, 7200);
     
     return session;
   }

   async completeStep(labId, stepId, userInput, sessionId) {
     const verificationResult = await this.verifyStep(stepId, userInput);
     
     const dbSessionId = sessionId || labId;
     await this.postgres.query(
       'INSERT INTO lab_steps (session_id, step_id, user_input, passed) VALUES ($1, $2, $3, $4)',
       [dbSessionId, stepId, userInput, verificationResult.passed]
     );
     
     return verificationResult;
   }

  async verifyStep(step, input) {
    if (step.verification.type === 'click') {
      return { passed: input === step.verification.expected };
    }
    if (step.verification.type === 'typing') {
      const similarity = this.calculateSimilarity(input.toLowerCase(), step.verification.expected.toLowerCase());
      return { passed: similarity >= (step.verification.tolerance || 0.8), similarity };
    }
    if (step.verification.type === 'cli') {
      const expected = Array.isArray(step.verification.expected) ? step.verification.expected : [step.verification.expected];
      const inputCmds = input.toLowerCase().split(',').map(s => s.trim());
      const passed = expected.every(cmd => inputCmds.some(ic => ic.includes(cmd.toLowerCase())));
      return { passed };
    }
    return { passed: false };
  }

  calculateSimilarity(a, b) {
    if (a === b) return 1;
    const longer = a.length > b.length ? a : b;
    const shorter = a.length > b.length ? b : a;
    if (longer.length === 0) return 1;
    const editDist = this.levenshtein(longer, shorter);
    return (longer.length - editDist) / longer.length;
  }

  levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        dp[i][j] = Math.min(dp[i-1][j] + 1, dp[i][j-1] + 1, dp[i-1][j-1] + (a[i-1] !== b[j-1] ? 1 : 0));
    return dp[m][n];
  }

  async executeCommand(deviceId, command) {
    const device = this.deviceManager.getDeviceInfo(deviceId);
    if (!device) return { error: 'Device not found' };
    
    const cmdLower = command.toLowerCase().trim();
    let output = '';
    
    if (cmdLower === 'show ip interface brief') {
      output = 'Interface              IP-Address      OK? Method Status                Protocol\n';
      output += 'GigabitEthernet0/0/0   172.16.0.1     YES manual up                    up\n';
      output += 'GigabitEthernet0/0/1   10.0.0.1       YES manual up                    up\n';
      output += 'GigabitEthernet0/0/2   203.0.113.1    YES manual up                    up\n';
      output += 'Serial0/0/0            10.255.255.1   YES manual up                    up';
    } else if (cmdLower === 'show ip route') {
      output = 'Gateway of last resort is not set\n';
      output += 'C    10.0.0.0/24 is directly connected, GigabitEthernet0/0/1\n';
      output += 'C    172.16.0.0/24 is directly connected, GigabitEthernet0/0/0\n';
      output += 'C    203.0.113.0/24 is directly connected, GigabitEthernet0/0/2';
    } else if (cmdLower === 'show version') {
      output = 'Cisco IOS XE Software, Version 17.06.01\n';
      output += 'CyberNet-Lab-Core uptime is 1 week, 2 days, 3 hours, 45 minutes\n';
      output += 'System image file is "flash:packages.conf"';
    } else if (cmdLower === 'show processes cpu sorted') {
      output = 'CPU utilization for five seconds: 2%/0%; one minute: 3%; five minutes: 2%\n';
      output += 'PID Runtime(ms)     Invoked      uSecs   5Sec   1Min   5Min TTY Process\n';
      output += '  1          1234       50000        24  0.00%  0.00%  0.00%   0 *System';
    } else if (cmdLower === 'clear') {
      output = 'Screen cleared';
    } else {
      output = `% Invalid command: "${command}"\nType 'show ip interface brief' or 'show ip route' to begin.`;
    }
    
    return { deviceId, command, output, timestamp: Date.now() };
  }

  async injectError(labId, errorType) {
    const lab = Array.from(this.labs.values()).find(l => String(l.id) === String(labId));
    if (!lab) {
      this.labs.set(String(labId), { id: String(labId) });
      return { result: true, labId, errorType: errorType || 'interface_down' };
    }
    
    const injection = {
      labId,
      errorType: errorType || 'interface_down',
      injectedAt: Date.now(),
      metadata: { autoInjected: false }
    };
    
    return { result: true, ...injection };
  }

  async pushConfig(labId, config) {
    const lab = Array.from(this.labs.values()).find(l => String(l.id) === String(labId));
    if (!lab) {
      throw new Error(`Lab ${labId} not found`);
    }
    await this.redis.set(`lab:config:${labId}`, config, 86400);
    return { success: true, labId, config };
  }

async resetLab(labId) {
     const { labCache } = require('../state/state');
     for (const [key, value] of labCache) {
       if (value.labId === labId) {
         labCache.delete(key);
       }
     }
     return { success: true, message: `Lab ${labId} reset` };
   }
}

module.exports = { LabEngine };
