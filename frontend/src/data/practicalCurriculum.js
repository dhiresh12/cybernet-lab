/**
 * Blueprint curriculum contract.
 *
 * Stages are skill gates, not a list of decorative topics. A stage becomes
 * available from real catalog coverage and learner evidence; it is never
 * marked mastered from a fabricated percentage.
 */
export const PRACTICAL_LEARNING_CYCLE = [
  { id: 'observe', label: 'Observe', prompt: 'Read the topology, ticket, and baseline before changing anything.', zhPrompt: '在更改之前阅读拓扑、工单和基线。', jaPrompt: '変更する前に、トポロジー、チケット、およびベースラインを読みます。' },
  { id: 'predict', label: 'Predict', prompt: 'Write what you expect to happen and which evidence will prove it.', zhPrompt: '写下你的预期结果以及哪些证据可以证明它。', jaPrompt: '何が起こると予想し、どの証拠がそれを証明するかを書き込みます。' },
  { id: 'perform', label: 'Perform', prompt: 'Make the smallest supported configuration change in the lab.', zhPrompt: '在实验中进行最小的受支持的配置更改。', jaPrompt: '実験室で最小限のサポートされている構成変更を行います。' },
  { id: 'verify', label: 'Verify', prompt: 'Use an independent show, state, or connectivity check.', zhPrompt: '使用独立的显示、状态或连接检查来验证。', jaPrompt: '独立した表示、状態、または接続チェックを使用して検証します。' },
  { id: 'explain', label: 'Explain', prompt: 'Explain the cause, result, and limitation in simple technical language.', zhPrompt: '用简单的专业技术语言解释原因、结果和局限性。', jaPrompt: 'シンプルな技術言語で原因、結果、および制限を説明します。' },
  { id: 'transfer', label: 'Transfer', prompt: 'Apply the skill to a new topology or a seeded fault.', zhPrompt: '将技能应用到新的拓扑或种子故障。', jaPrompt: 'スキルを新しいトポロジーまたはシード障害に適用します。' }
];

export const PRACTICAL_CURRICULUM = [
  {
    id: 'foundations',
    level: 0,
    title: 'Foundations',
    shortTitle: 'Foundations',
    description: 'Build the vocabulary and safe working habits needed before configuration.',
    skills: ['device and interface identification', 'CLI modes', 'lab safety', 'evidence capture'],
    categories: ['Basics', 'Foundations', 'CLI'],
    color: '#00f0ff',
    gate: 'Explain one command and identify its target device before running it.',
    transfer: 'Identify an unfamiliar interface and predict which command can verify it.',
    remediation: 'Replay the guided command tutorial with hints enabled.',
    zhStrategy: '高考/考研方法：通过命令原理解义和典型例题建立基础，用课堂练习检测盲区。',
    jaStrategy: '東大式方法：理解命令背后原理，用自己的话复述后再做练习。',
    zh: {
      title: '打基础',
      description: '建立网络词汇和安全的工作习惯，这是配置之前的基础。',
      gate: '解释一条命令并识别其目标设备，然后再运行它。',
      transfer: '识别一个不熟悉的接口，并预测哪个命令可以验证它。',
      remediation: '重播带有提示的命令教程。'
    },
    ja: {
      title: '基礎',
      description: 'ネットワークの用語と安全な作業習慣を構築し、設定前に必要とします。',
      gate: 'コマンドを説明し、ターゲットデバイスを特定してから実行します。',
      transfer: '不慣れているインターフェースを特定し、どの命令で検証できるかを予測します。',
      remediation: 'ヒント付きのコマンドチュートリアルを再再生します。'
    }
  },
  {
    id: 'networking-foundations',
    level: 1,
    title: 'Networking Foundations',
    shortTitle: 'Connectivity',
    description: 'Build a two-host network and prove same-subnet communication with evidence.',
    skills: ['Ethernet and switching', 'IPv4 and masks', 'ARP and ICMP', 'topology reading'],
    categories: ['ICMP', 'IPv4', 'Ethernet', 'Basics', 'Connectivity'],
    color: '#00ff88',
    gate: 'Configure addressing, verify interface state, and explain why ping passes or fails.',
    transfer: 'Repair the same skill on a different host pair without copying the solution.',
    remediation: 'Return to addressing and interface-status labs before routing.',
    zhStrategy: '高考/考研方法：配置IP时用手计算子网，用ping检测连通性。典型例题：192.168.x.x/24网络通不通。',
    jaStrategy: '東大式方法：アドレス指定は手でサブネットを計算し、pingで到達可能性を検証します。典型的な例題：192.168.x.x/24ネットワークで疎通が取れるか確認します。',
    zh: {
      title: '网络基础',
      description: '构建双主机网络，并用证据证明同一子网通信。',
      gate: '配置寻址，验证接口状态，并解释 ping 通过或失败的原因。',
      transfer: '在不同的主机对上修复同一技能，不复制解决方案。',
      remediation: '在路由之前返回寻址和接口状态实验。'
    },
    ja: {
      title: 'ネットワーク基礎',
      description: '2 ホストのネットワークを構築し、同一サブネット通信を証明します。',
      gate: 'アドレス指定を構成し、インターフェース状態を確認し、ping が成功/失敗する理由を説明します。',
      transfer: '解決策をコピーせずに別のホストペアで同じスキルを修復します。',
      remediation: 'ルーティングの前にアドレス指定とインターフェース状態のラボに戻ります。'
    }
  },
  {
    id: 'switching',
    level: 2,
    title: 'Switching and Segmentation',
    shortTitle: 'Switching',
    description: 'Separate departments safely using VLANs, access ports, trunks, and verification.',
    skills: ['VLANs', 'access and trunk ports', 'MAC learning', 'port security'],
    categories: ['VLAN', 'Switching', 'Trunking', 'Port Security'],
    color: '#ffbf00',
    gate: 'Prove intended reachability and isolation; do not rely on a green status alone.',
    transfer: 'Diagnose a VLAN mismatch from evidence rather than rebuilding the topology.',
    remediation: 'Practice show vlan and interface checks on the smallest available lab.',
    zhStrategy: '高考/考研方法：先画真实的VLAN图，用show命令核对MAC表，最后用故障排查模板。',
    jaStrategy: '東大式方法：VLAN構成を正確に把握し、showコマンドでMACテーブルを確認した後、問題診断のフレームワークを適用します。',
    zh: {
      title: '交换与分段',
      description: '使用 VLAN、访问端口、干线和验证安全地分隔部门。',
      gate: '证明预期的可达性和隔离；切勿仅依赖绿色状态。',
      transfer: '从证据中诊断 VLAN 不匹配，而不是重新搭建拓扑。',
      remediation: '在最小可用的实验中练习 show vlan 和接口检查。'
    },
    ja: {
      title: 'スイッチングとセグメンテーション',
      description: 'VLAN、アクセスポート、トランク、検証を使用して部門を安全に分割します。',
      gate: '意図到達性と分離を証明します；緑色の状態に頼らないでください。',
      transfer: '証拠から VLAN ママッチングを診断し、トポロジーを再構築しません。',
      remediation: '最小限の実験で show vlan とインターフェースチェックを練習します。'
    }
  },
  {
    id: 'routing',
    level: 3,
    title: 'Routing and Failure Recovery',
    shortTitle: 'Routing',
    description: 'Interpret routes, configure supported paths, and recover from a controlled fault.',
    skills: ['connected and static routes', 'default gateway', 'routing tables', 'failure isolation'],
    categories: ['Routing', 'Static Routing', 'OSPF', 'EIGRP'],
    color: '#ff3355',
    gate: 'Provide before/after evidence and a safe rollback for a route change.',
    transfer: 'Find the smallest failing hop in a new multi-network topology.',
    remediation: 'Repeat an addressing lab, then inspect routes before changing them.',
    zhStrategy: '高考/考研方法：先做题型分类，用show ip route查路由表，最后总结路由策略。',
    jaStrategy: '東大式方法：ルーティング問題をタイプ別に整理し、show ip route でテーブル確認、その後戦略をまとめます。',
    zh: {
      title: '路由与故障恢复',
      description: '解释路由，配置支持的路径，并从受控故障中恢复。',
      gate: '提供变更前/后的证据和安全的回滚策略。',
      transfer: '在新多网络拓扑中找到最小的故障跃点。',
      remediation: '重复寻址实验，然后在更改前检查路由。'
    },
    ja: {
      title: 'ルーティングと障害復旧',
      description: 'ルートを解釈し、サポートされているパスを構成し、制御された障害から回復します。',
      gate: 'ルート変更の前後の証拠と安全なロールバックを提供します。',
      transfer: '新しいマルチネットワークトポロジーで最小限の障害ホップを見つけます。',
      remediation: 'アドレス指定のラボを繰り返してから、変更前にルートを確認します。'
    }
  },
  {
    id: 'services',
    level: 4,
    title: 'Network Services',
    shortTitle: 'Services',
    description: 'Connect configuration to user-facing services and troubleshoot reachability.',
    skills: ['DHCP DORA', 'DNS resolution', 'NAT/PAT', 'SSH and logs'],
    categories: ['DHCP', 'DNS', 'NAT', 'Services', 'SSH'],
    color: '#00ffcc',
    gate: 'Show the service symptom, isolate the cause, and verify recovery independently.',
    transfer: 'Differentiate a client, gateway, and service failure from the same symptom.',
    remediation: 'Use a guided service lab with one fault enabled.',
    zhStrategy: '高考/考研方法：先看故障现象，用DORA/RFC步骤排查，再查日志定位根因。',
    jaStrategy: '東大式方法：症状から読み取り、DORA/RFCの工程でトラブルシューティング、その後ログで根本原因を特定します。',
    zh: {
      title: '网络服务',
      description: '将配置与面向用户的服务连接，并排查可达性。',
      gate: '显示服务症状，隔离原因，并独立验证恢复。',
      transfer: '区分同一症状下的客户端、网关和服务故障。',
      remediation: '使用带有单个故障的指导性服务实验。'
    },
    ja: {
      title: 'ネットワークサービス',
      description: '構成をユーザー向けサービスに接続し、到達可能性をトラブルシューティングします。',
      gate: 'サービスの症状を示し、原因を分離し、回復を独立に検証します。',
      transfer: '同じ症状からクライアント、ゲートウェイ、サービスの障害を区別します。',
      remediation: '1 つの障害を有効にしたガイド付きサービス ラボを使用します。'
    }
  },
  {
    id: 'security',
    level: 5,
    title: 'Security Foundations',
    shortTitle: 'Security',
    description: 'Apply authorization, least privilege, segmentation, and defensive evidence.',
    skills: ['secure management', 'ACL first-match logic', 'port security', 'incident evidence'],
    categories: ['Security', 'ACL', 'Network Security'],
    color: '#ffcc00',
    gate: 'Confirm scope, make a least-privilege change, verify it, and record rollback.',
    transfer: 'Contain a synthetic fault without touching an out-of-scope device.',
    remediation: 'Review the rules of engagement and ACL evaluation order.',
    zhStrategy: '高考/考研方法：先列出规则，再做最小权限演练，最后写回滚方案。',
    jaStrategy: '東大式方法：ルールを網羅し、最小権限の実践を行い、ロールバック手順をドキュメント化します。',
    zh: {
      title: '安全基础',
      description: '应用授权、最小权限、分段和防御性证据。',
      gate: '确认范围，进行最小权限变更，验证它，并记录回滚。',
      transfer: '在不接触范围外设备的情况下隔离合成故障。',
      remediation: '审查参与规则和 ACL 评估顺序。'
    },
    ja: {
      title: 'セキュリティ基礎',
      description: '認可、最小権限、セグメンテーション、防御的証拠を適用します。',
      gate: '範囲を確認し、最小権限の変更を加え、検証し、ロールバックを記録します。',
      transfer: '範囲外のデバイスに触れないで合成障害を隔離します。',
      remediation: 'エンゲージメントルールと ACL 評価順を確認します。'
    }
  },
  {
    id: 'advanced-engineering',
    level: 6,
    title: 'Advanced Engineering',
    shortTitle: 'Advanced',
    description: 'Use automation, IPv6, packet evidence, backups, and controlled change practice.',
    skills: ['multi-site design', 'IPv6', 'automation concepts', 'config diff and rollback'],
    categories: ['Enterprise', 'IPv6', 'Automation', 'Data Center', 'Design'],
    color: '#aa00ff',
    gate: 'Compare intended and observed state and explain unsupported capabilities honestly.',
    transfer: 'Adapt a design to a changed requirement without hiding trade-offs.',
    remediation: 'Complete the routing and services gates first.',
    zhStrategy: '高考/考研方法：先做设计题，再练自动化脚本，最后用案例分析验证能力。',
    jaStrategy: '東大式方法：設計問題を演習し、自動化スクリプトを書いて、ケーススタディで能力を検証します。',
    zh: {
      title: '高级工程',
      description: '使用自动化、IPv6、数据包证据、备份和受控的变更实践。',
      gate: '对比预期和观察到的状态，并诚实解释不支持的功能。',
      transfer: '适应变化的需求，不隐藏权衡。',
      remediation: '首先完成路由和服务关卡。'
    },
    ja: {
      title: '高度エンジニアリング',
      description: '自動化、IPv6、パケット証拠、バックアップ、制御された変更実習を使用します。',
      gate: '意図した状態と観察された状態を比較し、サポートされていない機能を正直に説明します。',
      transfer: 'トレードオフを隠さず、変更された要件に設計を適応します。',
      remediation: 'まずルーティングとサービスのゲートを完了します。'
    }
  },
  {
    id: 'capstone',
    level: 7,
    title: 'Professional Capstone',
    shortTitle: 'Capstone',
    description: 'Resolve an ambiguous ticket with evidence, safe change, and a stakeholder report.',
    skills: ['hypothesis-driven troubleshooting', 'root cause', 'prevention', 'communication'],
    categories: ['Troubleshooting', 'Capstone', 'Incident Response'],
    color: '#ffaa00',
    gate: 'Pass a transfer challenge and submit a complete evidence-backed debrief.',
    transfer: 'Solve a hidden seeded fault with multiple plausible causes.',
    remediation: 'Use the weakest previous skill as the next recommended practice.',
    zh: {
      title: '专业桩石',
      description: '用证据、安全的更改和利益相关者报告来解决模棱两可的工单。',
      gate: '通过转移挑战并提交完整的证据支持的简报。',
      transfer: '具有多个合理原因的隐藏种子故障求解。',
      remediation: '作为下一个推荐练习使用最弱的先前技能。'
    },
    ja: {
      title: 'プロフェッショナル キャプストン',
      description: '証拠、安全な変更、およびステークホルダー レポートを使用して曖昧なチケットを解決します。',
      gate: '転送チャレンジに合格し、完全な証拠に基づく報告書を提出します。',
      transfer: '複数の原因を持つ隠されたシード障害を解決します。',
      remediation: '最も弱い以前のスキルを次の推奨練習として使用します。'
    },
    zhStrategy: '高考/考研方法：先掌握基础概念，再做典型例题，最后总结错题本。每个阶段用真题检测，不留盲区。',
    jaStrategy: '東大式方法：深い理解を重視し、なぜそうなるかを説明する。自分の言葉で言い換えてから練習問題に進む。'
  },
];

export function getStageLabs(stage, labs) {
  const categorySet = new Set(stage.categories.map(category => category.toLowerCase()));
  return (Array.isArray(labs) ? labs : []).filter(lab => {
    const category = String(lab.category || '').toLowerCase();
    return categorySet.has(category) || (lab.tags || []).some(tag => categorySet.has(String(tag).toLowerCase()));
  });
}

export function getTransferLab(stage, labs, completedSteps = []) {
  const stageLabs = getStageLabs(stage, labs).filter(lab => Array.isArray(lab.steps) && lab.steps.length > 0);
  if (stageLabs.length === 0) return null;

  const completionRatio = (lab) => {
    const completed = lab.steps.filter(step => completedSteps.includes(step.stepId)).length;
    return completed / lab.steps.length;
  };

  return [...stageLabs].sort((a, b) => {
    const ratioDifference = completionRatio(a) - completionRatio(b);
    if (ratioDifference !== 0) return ratioDifference;
    return String(a.id).localeCompare(String(b.id));
  })[0];
}

export function getStageStatus(stage, labs, completedSteps = [], evidenceRecords = [], transferAttempts = []) {
  const stageLabs = getStageLabs(stage, labs);
  // Preserve the original catalog-only behavior for callers that have not
  // loaded learner evidence yet.
  if (arguments.length < 4) {
    const completedLabs = stageLabs.filter(lab =>
      Array.isArray(lab.steps) &&
      lab.steps.length > 0 &&
      lab.steps.every(step => completedSteps.includes(step.stepId))
    );
    const inProgress = stageLabs.some(lab =>
      (lab.steps || []).some(step => completedSteps.includes(step.stepId)) &&
      !(lab.steps || []).every(step => completedSteps.includes(step.stepId))
    );
    if (completedLabs.length > 0 && completedLabs.length === stageLabs.length) return 'mastered';
    if (completedLabs.length > 0 || inProgress) return 'practiced';
    return stageLabs.length > 0 ? 'available' : 'unavailable';
  }

  const completedLabIds = new Set(stageLabs
    .filter(lab => lab.steps?.length && lab.steps.every(step => completedSteps.includes(step.stepId)))
    .map(lab => String(lab.id)));
  const hasActivity = stageLabs.some(lab => (lab.steps || []).some(step => completedSteps.includes(step.stepId)));
  const stageEvidence = evidenceRecords.filter(record => stageLabs.some(lab => String(lab.id) === String(record.labId)));
  const hasVerification = stageEvidence.some(record => record.passed && record.verificationType);
  const hasReflection = stageEvidence.some(record =>
    record.prediction?.trim() && record.evidence?.trim() && record.explanation?.trim()
  );
  const hasTransfer = transferAttempts.some(attempt =>
    attempt.stageId === stage.id && attempt.passed === true
  );

  if (!stageLabs.length) return 'unavailable';
  if (!hasActivity) return 'not_started';
  if (!completedLabIds.size) return 'introduced';
  if (!hasVerification) return 'practiced';
  if (!hasTransfer) return 'verified';
  if (!hasReflection) return 'transferred';
  return 'mastered';
}
