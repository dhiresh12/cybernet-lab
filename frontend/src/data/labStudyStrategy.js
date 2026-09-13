export const STUDY_STRATEGY = {
  foundations: {
    zhStrategy: '基础阶段：先背命令语法和英文术语，用小型例题建立条件反射；每次练习先写预测再动手，记录错误类型。',
    jaStrategy: '基礎段階：コマンド構文と英単語を暗記し、小さな例題で条件反射を作る。毎回予測を書いてから実行し、エラーの種類を記録する。',
    syllabus: [
      '网络设备基本概念：理解路由器、交换机、防火墙的功能区别',
      '命令行界面基础：掌握用户模式、特权模式、全局配置模式的切换',
      '网络拓扑识别：学习读取基本网络图并识别关键设备',
      'IP地址基础：理解IPv4地址结构、子网掩码和广播地址计算',
      '基本连通性测试：掌握ping和traceroute的使用方法和结果解释',
      '安全操作规范：学习配置前的备份习惯和变更记录要求'
    ]
  },
  'networking-foundations': {
    zhStrategy: '网络基础：手算子网和地址范围，用 ping/traceroute 验证每条路径；先画拓扑再配 IP，避免只依赖绿色状态。',
    jaStrategy: 'ネットワーク基礎：サブネットとアドレス範囲を手計算し、ping/traceroute で各パスを検証。配置前にトポロジーを描き、緑色の状態だけに頼らない。',
    syllabus: [
      'IP地址和子网掩码计算：练习手算网络号、广播号和可用主机范围',
      'ARP协议工作原理：理解地址解析过程及MAC地址学习机制',
      'ICMP协议应用：掌握不同ICMP消息类型及其在网络诊断中的作用',
      '以太网和交换机基础：学习帧格式、MAC地址和交换机转发原理',
      '接口状态验证：掌握show interfaces和show ip interface brief的使用',
      '基本故障隔离方法：分步骤排查物理层、数据链路层和网络层问题'
    ]
  },
  switching: {
    zhStrategy: '交换分段：先画 VLAN 拓扑图，用 show 命令核对 MAC 表和 VLAN 数据库，再用故障排查模板定位隔离问题。',
    jaStrategy: 'スイッチングとセグメンテーション：VLAN トポロジーを描き、show コマンドで MAC テーブルと VLAN データベースを確認。トラブルシューティングテンプレートで分離問題を特定する。',
    syllabus: [
      'VLAN概念和种类：理解访问端口、中继端口和native VLAN的区别',
      'VLAN配置验证：掌握show vlan、show interfaces switchport和show mac address-table的使用',
      '生成树协议基础：理解STP/RSTP工作原理及端口角色选举',
      '端口聚合技术：学习LACP和静态聚合的配置与验证方法',
      'VLAN间路由原理：理解SVI和路由器在分段网络中的作用',
      '交换机安全特性：掌握端口安全、DHCP蜻蜓和IP源防护的基本概念'
    ]
  },
  routing: {
    zhStrategy: '路由与故障恢复：先做题型分类，用 show ip route 检查路由表并标记不活跃路由；小结路由策略和故障恢复顺序。',
    jaStrategy: 'ルーティングと障害復旧：問題タイプを分類し、show ip route でルーティングテーブルを確認して非アクティブルートをマーク。ルーティング戦略と障害復旧の順序をまとめる。',
    syllabus: [
      '路由协议分类：理解距离矢量(RIP)和链路状态(OSPF/ISIS)协议的区别',
      '静态路由配置：掌握ip route命令语法及浮动静态路由的应用',
      '默认路由概念：理解0.0.0.0/0路由及其在边界网络中的作用',
      'OSPF基础概念：学习区域、LSA类型及邻居建立过程',
      '路由表分析：掌握解读show ip route输出及管理距离(AD)概念',
      '路由故障诊断：学习使用show ip ospf neighbor和debug技术进行故障隔离'
    ]
  },
  services: {
    zhStrategy: '网络服务：先观察服务症状（DHCP 无响应、DNS 解析失败），按 DORA/RFC 步骤排查，再用日志定位根因。',
    jaStrategy: 'ネットワークサービス：サービス症状（DHCP 無応答、DNS 解析失敗）を観察し、DORA/RFC 手順で排查。ログで根本原因を特定する。',
    syllabus: [
      'DHCP工作原理：理解DORA过程及租约更新机制',
      'DNS解析过程：掌握递归查询和迭代查询的区别及常见记录类型',
      'NAT/PAT技术：理解源NAT、目的NAT及端口转换的工作原理',
      '网络时间协议：学习NTP工作原理及时钟同步的重要性',
      '系统日志管理：掌握日志级别、缓冲区及远程日志服务器配置',
      '网络服务监控：学习使用show命令验证服务状态及性能基线建立'
    ]
  },
  security: {
    zhStrategy: '安全基础：先列出安全规则清单，做最小权限演练，记录每次 ACL 评估顺序和回滚方案，避免越界操作。',
    jaStrategy: 'セキュリティ基礎：セキュリティルールを網羅し、最小権限の実践を行う。ACL 評価の順序とロールバック手順を記録し、範囲外の操作を避ける。',
    syllabus: [
      '访问控制列表基础：理解标准ACL和扩展ACL的区别及匹配顺序',
      '安全区域概念：学习不同安全级别区域间的通信控制策略',
      '端口安全技术：掌握MAC地址绑定及违规处理模式的配置方法',
      'SSH安全加固：理解版本选择、认证方式及访问控制的最佳实践',
      '网络地址转换安全：学习NAT与ACL结合使用的安全考虑因素',
      '安全事件响应：掌握取证证据收集及事件时间线重建的基本方法'
    ]
  },
  'advanced-engineering': {
    zhStrategy: '高级工程：先做设计题练习自动化脚本，再对比预期与实际状态；诚实记录不支持的能力和边界条件。',
    jaStrategy: '高度エンジニアリング：設計問題で自動化スクリプトを練習し、意図した状態と観察された状態を比較。サポートされていない機能と境界条件を正直に記録する。',
    syllabus: [
      '网络自动化基础：理解配置管理工具及基础设施即代码(IaC)概念',
      'IPv6地址规划：学习全球单播、唯一本地和链路本地地址类型及子网划分',
      '虚拟化和云网络：理解VXLAN、NVGRE等封装技术及其在数据中心中的应用',
      '网络遥测技术：学习SNMP、NetFlow及流量分析在性能监控中的作用',
      '配置变更管理：掌握变更计划、回滚策略及风险评估方法',
      '高可用性设计：理解冗余设计、故障转移及负载均衡在企业网络中的应用'
    ]
  },
  capstone: {
    zhStrategy: '专业桩石：用假设驱动的方式排查隐藏故障，总结根因、预防措施和沟通要点，提交完整证据简报。',
    jaStrategy: 'プロフェッショナル キャプストン：仮説駆動で隠された障害を調査し、根本原因、予防策、コミュニケーションの要点をまとめ、完全な証拠に基づく報告書を提出する。',
    syllabus: [
      '假设驱动故障排查：学习根据症状形成检验假设及实验设计方法',
      '根因分析技术：掌握五为什么法及鱼骨图在网络故障分析中的应用',
      '影响评估方法：学习评估故障对业务的影响程度及恢复优先级排序',
      '变更管理流程：理解变更请求、风险评估及回滚计划的完整流程',
      '技术文档编写：掌握故障报告、变更记录及知识库文章的写作规范',
      '预防性措施制定：学习根据故障经验改进监控告警及操作规程的方法'
    ]
  },
  cabling: {
    zhStrategy: '布线基础：先识别物理接口和线缆类型，用指示灯和 show interface 交叉验证；记录每个接口的物理状态。',
    jaStrategy: 'ケーブル接続：物理インターフェースとケーブルの種類を特定し、ランプと show interface で交差検証。各インターフェースの物理状態を記録する。',
    syllabus: [
      '网络线缆类型：理解双绞线(UTP/STP)、光纤及同轴电缆的特点及应用场景',
      '接头标准和制作：学习RJ45、LC/SC等接头的压制方法及测试标准',
      '物理层故障诊断：掌握使用线缆测试仪及光功率计进行故障隔离',
      '接口错误统计：理解CRC错误、帧序列错误及碰撞在不同介质中的意义',
      '电磁兼容性考虑：学习线缆敷设中的干扰源及屏蔽要求',
      '现场布线规范：理解TIA/EIA-568标准及机房布线最佳实践'
    ]
  },
  'device-management': {
    zhStrategy: '设备管理：先理解设备角色和配置存储机制，再用备份与恢复流程练习配置管理。',
    jaStrategy: 'デバイス管理：デバイスの役割と設定格納メカニズムを理解し、バックアップと復旧のフローで構成管理を練習する。',
    syllabus: [
      '设备操作系统：理解不同厂商的网络操作系统特点及版本管理策略',
      '配置备份与版本控制：学习使用TFTP/FTP/SFTP进行配置备份及差异比较方法',
      '设备库存管理：掌握资产标签、序号追踪及维修历史记录的建立方法',
      '固件升级流程：理解发行说明阅读、风险评估及回滚准备的完整过程',
      '性能基线建立：学习收集设备基线性能数据及异常检测方法的建立',
      '设备健康监控：掌握使用SNMP及系统日志进行故障预警的配置方法'
    ]
  },
  'network-design': {
    zhStrategy: '网络设计：先根据业务需求设计拓扑，再分配 IP 和路由策略；最后做设计评审，诚实记录权衡。',
    jaStrategy: 'ネットワーク設計：ビジネス要件に基づいてトポロジーを設計し、IP とルーティング戦略を割り当て。設計レビューでトレードオフを正直に記録する。',
    syllabus: [
      '需求收集与分析：学习访谈技术及业务流程映射在网络需求中的应用',
      '逻辑拓扑设计：理解分层模型及企业网络常用设计范式的选取原则',
      '物理拓扑规划：学习机房布线、机柜规划及设备选型的考虑因素',
      'IP地址规划：掌握子网划分策略及预留地址段的分配原则',
      '路由协议选择：根据网络规模及特点选择合适的IGP及EGP方案',
      '设计审查与验证：学习使用检查清单及模拟工具进行设计有效性验证'
    ]
  },
  'network-monitoring': {
    zhStrategy: '网络监控：先定义监控指标和告警阈值，再用 show/log 工具验证监控覆盖范围。',
    jaStrategy: 'ネットワーク監視：監視指標とアラート閾値を定義し、show/log ツールで監視カバレッジを検証する。',
    syllabus: [
      '性能监控指标：了解带宽利用率、时延、丢包率及抖动的测量方法',
      '流量分析技术：学习使用NetFlow/IPFIX及数据包捕获进行应用识别',
      '事件关联分析：理解如何将不同监控源的数据关联进行根因分析',
      '阈值设定方法：学习基于基线数据设定动态及静态告警阈值的技巧',
      '监控工具选型：了解开源及商业监控平台的功能对比及部署考虑',
      '告警疲劳缓解：学习告警抑制、升级策略及通知聚合的最佳实践'
    ]
  },
  'network-performance': {
    zhStrategy: '网络性能：先识别性能基线，再用 ping/traceroute/show 工具定位延迟和丢包来源。',
    jaStrategy: 'ネットワーク性能：性能基準を特定し、ping/traceroute/show ツールでレイテンシとパケットロスの原因を特定する。',
    syllabus: [
      '性能基线建立：学习在不同业务负载下采集网络性能数据的方法',
      '时延成分分析：理解处理时延、排队时延及传播时延在不同网段中的贡献',
      '丢包原因定位：学习使用统计信息及高级命令区分拥塞丢包及错误丢包',
      '抖动测量方法：了解在实时业务场景中的抖动测量及其影响评估',
      '吞吐量测试技术：学习使用专业工具进行网络容量及业务性能测试',
      '质量服务验证：掌握检查QoS策略应用及业务分类结果的验证方法'
    ]
  },
  'network-planning': {
    zhStrategy: '网络规划：先做地址规划和资源分配，再验证可扩展性；最后制定实施排期。',
    jaStrategy: 'ネットワーク計画：アドレスとリソースの計画を立て、拡張性を検証。実施スケジュールを策定する。',
    syllabus: [
      '业务增长预测：学习根据历史数据及业务规划制定网络容量增长模型',
      '地址空间管理：理解IPv4地址节约技术及IPv6过渡策略的规划方法',
      '设备容量规划：掌握根据业务增长预测进行设备选型及扩容时机判断',
      '协议演进规划：了解新兴技术如SD-WAN及意图网络在网络演进中的作用',
      '风险评估方法：学习识别单点故障及制定相应的冗余方案和应急预案',
      '实施分期策略：理解如何将复杂升级分解为可管理的阶段及回滚节点'
    ]
  },
  'network-security': {
    zhStrategy: '网络安全：先定义攻击面和防御边界，再用 ACL 和安全策略验证每个边界点。',
    jaStrategy: 'ネットワークセキュリティ：攻撃面と防御境界を定義し、ACL とセキュリティポリシーで各境界点を検証する。',
    syllabus: [
      '网络威胁建模：学习使用攻击树及攻击库进行网络资产风险评估',
      '边界防御技术：理解防火墙、入侵防御系统及蜜罐在网络边缘的作用',
      '内网分段策略：学习使用VLAN、VRF及微分段实现最小权限访问控制',
      '安全日志分析：掌握使用SIEM工具进行事件关联及威胁检测的基本方法',
      '加密技术应用：了解IPsec及SSL/TLS在不同场景中的部署考虑因素',
      '合规性要求了解：学习常见行业标准如PCI-DSS及HIPAA对网络安全的具体要求'
    ]
  },
  packetAnalysis: {
    zhStrategy: '数据包分析：先理解数据包头部结构，再抓包并逐步分析字段含义。',
    jaStrategy: 'パケット分析：パケットヘッダーの構造を理解し、パケットをキャプチャしてフィールドの意味を段階的に分析する。',
    syllabus: [
      '以太网帧结构：了解目的MAC、源MAC及类型/长度字段的作用及常见值',
      'IP协议头部分析：掌握理解版本、首部长度、服务类型及标志位的含义',
      '传输层协议：学习识别TCP/UDP端口及理解序号、确认号及窗口大小的作用',
      '应用层协议特征：了解HTTP、DNS及DHCP等常见协议在数据包中的特征码',
      '异常流量识别：学习使用过滤表达式及统计功能定位扫描及恶意流量',
      '捕获文件管理：了解pcap格式及使用过滤规则进行高效分析的方法'
    ]
  },
  troubleshooting: {
    zhStrategy: '故障排查：先缩小问题范围，再逐层验证；用结构化方法记录症状、原因和解决步骤。',
    jaStrategy: 'トラブルシューティング：問題範囲を絞り、段階的に検証する。構造化手法で症状、原因、解決手順を記録する。',
    syllabus: [
      '问题定义技术：学习使用5W1H方法清晰描述故障现象及影响范围',
      '假设生成与验证：掌握根据OSI模型分层生成检验假设的思路框架',
      '证据链建立：学习收集时间线、配置更改及关键事件形成完整故障还原',
      '变更影响分析：理解如何评估最近变更对故障的可能贡献及回滚验证方法',
      '临时解决方案制定：学习在定位永久方案前实施风险可控的应急措施',
      '事后评估流程：掌握进行故障复盘及经验教训转化为预防措施的完整过程'
    ]
  }
};

const CATEGORY_STAGE_MAP = {
  'Networking Fundamentals': 'networking-foundations',
  'Network Design': 'advanced-engineering',
  'Network Planning': 'advanced-engineering',
  'Network Monitoring': 'advanced-engineering',
  'Network Performance': 'advanced-engineering',
  'Network Security': 'security',
  'Network Services': 'services',
  ICMP: 'networking-foundations',
  IPv6: 'advanced-engineering',
  NAT: 'services',
  DHCP: 'services',
  DNS: 'services',
  Security: 'security',
  ACL: 'security',
  SSH: 'services',
  BGP: 'routing',
  OSPF: 'routing',
  EIGRP: 'routing',
  RIP: 'routing',
  'Static Routing': 'routing',
  'Default Routing': 'routing',
  Routing: 'routing',
  VLAN: 'switching',
  Switching: 'switching',
  Trunking: 'switching',
  'Port Security': 'switching',
  STP: 'switching',
  EtherChannel: 'switching',
  Ethernet: 'networking-foundations',
  Subnetting: 'networking-foundations',
  TCPIP: 'networking-foundations',
  Cabling: 'foundations',
  'Device Management': 'foundations',
  OSI: 'foundations',
  Fundamentals: 'foundations',
  Cisco: 'foundations',
  Troubleshooting: 'capstone',
  VPN: 'services',
  DataCenter: 'advanced-engineering',
  Automation: 'advanced-engineering',
  Wireless: 'advanced-engineering',
  'Wireless Networking': 'advanced-engineering'
};

function resolveStage(category, level) {
  const direct = CATEGORY_STAGE_MAP[category];
  if (direct) return direct;
  const lowerCategory = (category || '').toLowerCase();
  if (lowerCategory.includes('switch')) return 'switching';
  if (lowerCategory.includes('route')) return 'routing';
  if (lowerCategory.includes('security') || lowerCategory.includes('acl')) return 'security';
  if (lowerCategory.includes('dhcp') || lowerCategory.includes('dns') || lowerCategory.includes('nat')) return 'services';
  if (lowerCategory.includes('design') || lowerCategory.includes('plan') || lowerCategory.includes('monitor') || lowerCategory.includes('perform')) return 'advanced-engineering';
  if (lowerCategory.includes('trouble') || lowerCategory.includes('packet') || lowerCategory.includes('troubleshoot')) return 'capstone';
  if (lowerCategory.includes('found') || lowerCategory.includes('basics') || lowerCategory.includes('cli') || lowerCategory.includes('cabling') || lowerCategory.includes('device') || lowerCategory.includes('osi')) return 'foundations';
  if (lowerCategory.includes('vlan') || lowerCategory.includes('trunk') || lowerCategory.includes('port') || lowerCategory.includes('stp')) return 'switching';
  return 'networking-foundations';
}

export function getLabStudyStrategy(lab) {
  const category = lab.category || 'General';
  const stage = resolveStage(category, lab.level);
  const stageData = STUDY_STRATEGY[stage] || STUDY_STRATEGY['networking-foundations'];
  const level = lab.level || lab.difficulty || 'basic';

  const levelPrefix = level === 'advanced' ? '（上級）' : level === 'intermediate' ? '（中級）' : '（初級）';

  return {
    stage,
    zhStrategy: stageData.zhStrategy + levelPrefix,
    jaStrategy: stageData.jaStrategy + levelPrefix,
    zhSyllabus: stageData.syllabus,
    jaSyllabus: stageData.syllabus,
    zhSyllabusTitle: '学習シラバス（中国戦略）',
    jaSyllabusTitle: '学習シラバス（日本戦略）',
    zhSyllabusTitleShort: '中国学习法 シラバス',
    jaSyllabusTitleShort: '日本学び方 シラバス'
  };
}

export default { STUDY_STRATEGY, getLabStudyStrategy };