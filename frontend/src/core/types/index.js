/**
 * @typedef {Object} Lab
 * @property {number|string} id
 * @property {string} title
 * @property {string} category
 * @property {string} level
 * @property {string} difficulty
 * @property {number} time
 * @property {string} objectives
 * @property {string} scenario
 * @property {string[]} concepts
 * @property {Object[]} errors
 * @property {Object[]} questions
 * @property {LabStep[]} steps
 * @property {Object} topology
 * @property {string[]} prerequisites
 * @property {string} detailedWalkthrough
 * @property {string} walkthrough
 * @property {Object} devices
 * @property {string[]} connections
 * @property {Object} ipScheme
 * @property {string} task
 * @property {Object[]} commonErrors
 * @property {Object} troubleshooting
 * @property {Object[]} hints
 * @property {Object} challenge
 * @property {Object} solution
 * @property {string[]} keyConcepts
 * @property {Object[]} practiceQuestions
 * @property {Object[]} quiz
 * @property {Object} packetTracer
 * @property {string} learningObjective
 * @property {Object[]} deviceList
 * @property {Object} ipAddressing
 * @property {string} explanation
 * @property {Object} finalVerification
 * @property {Object[]} quizQuestions
 */

/**
 * @typedef {Object} LabStep
 * @property {string} stepId
 * @property {string} title
 * @property {string} instruction
 * @property {string[]} commands
 * @property {string} expectedOutput
 * @property {Object} verification
 * @property {string[]} commonErrors
 * @property {string[]} hints
 * @property {Object} challenge
 */

/**
 * @typedef {'basic'|'intermediate'|'advanced'} LabDifficulty
 */

/**
 * @typedef {Object} Device
 * @property {string} id
 * @property {string} name
 * @property {DeviceType} type
 * @property {string} label
 * @property {string} ip
 * @property {string} status
 * @property {string} hostname
 * @property {DeviceMode} mode
 * @property {string|null} configMode
 * @property {Object<string, Interface>} interfaces
 * @property {Object<string, Vlan>} vlans
 * @property {RoutingState} routing
 * @property {Object<string, ArpEntry>} arpTable
 * @property {AclState} acl
 * @property {NatState} nat
 * @property {DhcpState} dhcp
 * @property {SshState} ssh
 * @property {Object} portSecurity
 * @property {NtpState} ntp
 * @property {Object[]} configHistory
 * @property {Object[]} stateHistory
 */

/**
 * @typedef {'router'|'switch'|'pc'|'laptop'|'server'|'firewall'|'accessPoint'|'cloud'|'dns'|'dhcp'} DeviceType
 */

/**
 * @typedef {'user'|'enable'|'config'|'interface'|'acl'|'dhcp'} DeviceMode
 */

/**
 * @typedef {Object} Interface
 * @property {string} ip
 * @property {string} mask
 * @property {'up'|'down'} status
 * @property {'up'|'down'} protocol
 * @property {string} description
 * @property {number} vlan
 * @property {number[]} trunkAllowed
 * @property {number} trunkNativeVlan
 * @property {Object|null} portSecurity
 * @property {boolean} dhcpClient
 */

/**
 * @typedef {Object} Vlan
 * @property {string} name
 * @property {string[]} ports
 */

/**
 * @typedef {Object} RoutingState
 * @property {StaticRoute[]} staticRoutes
 * @property {Object|null} rip
 * @property {Object|null} ospf
 * @property {Object|null} eigrp
 * @property {Object|null} bgp
 */

/**
 * @typedef {Object} StaticRoute
 * @property {string} network
 * @property {string} mask
 * @property {string} nextHop
 * @property {number} [ad]
 */

/**
 * @typedef {Object} ArpEntry
 * @property {string} ip
 * @property {string} mac
 * @property {string} interface
 */

/**
 * @typedef {Object} AclState
 * @property {AclEntry[]} entries
 * @property {Object<string, string>} applied
 */

/**
 * @typedef {Object} AclEntry
 * @property {number} seq
 * @property {'permit'|'deny'} action
 * @property {string} protocol
 * @property {string} source
 * @property {string} sourceWildcard
 * @property {string} destination
 * @property {string} destWildcard
 * @property {Object} [ports]
 */

/**
 * @typedef {Object} NatState
 * @property {Object[]} insideSource
 * @property {Object[]} outsideSource
 * @property {Object} translations
 */

/**
 * @typedef {Object} DhcpState
 * @property {DhcpPool[]} pools
 * @property {string[]} excluded
 * @property {Object} bindings
 */

/**
 * @typedef {Object} DhcpPool
 * @property {string} name
 * @property {string} network
 * @property {string} mask
 * @property {string[]} excluded
 * @property {string} defaultRouter
 * @property {string} dnsServer
 */

/**
 * @typedef {Object} SshState
 * @property {boolean} enabled
 * @property {number} version
 * @property {string[]} users
 * @property {string|null} domain
 * @property {Object|null} keys
 */

/**
 * @typedef {Object} NtpState
 * @property {string[]} servers
 */

/**
 * @typedef {Object} NetworkLink
 * @property {string} from
 * @property {string} to
 * @property {string} type
 * @property {string} status
 */

/**
 * @typedef {Object} Packet
 * @property {string} id
 * @property {string} from
 * @property {string} to
 * @property {number} progress
 * @property {string} mode
 * @property {string} status
 */

/**
 * @typedef {Object} Route
 * @property {string} network
 * @property {string} mask
 * @property {string} nextHop
 * @property {string} interface
 * @property {string} protocol
 * @property {number} metric
 */

/**
 * @typedef {Object} CliCommand
 * @property {string} command
 * @property {string[]} args
 * @property {DeviceMode} requiredMode
 * @property {Function} handler
 */

/**
 * @typedef {Object} SimulationState
 * @property {Object<string, Device>} devices
 * @property {number} currentStep
 * @property {string[]} completedSteps
 * @property {number} score
 * @property {number} hintsUsed
 * @property {number} startTime
 * @property {Object} deviceStates
 * @property {Object} topology
 * @property {string[]} errors
 * @property {boolean} active
 */

/**
 * @typedef {Object} VerificationResult
 * @property {boolean} passed
 * @property {string} message
 * @property {Object} [details]
 */

/**
 * @typedef {Object} QuizQuestion
 * @property {string} question
 * @property {string} solution
 * @property {string[]} options
 * @property {number} correctIndex
 */