export type ComponentDef = {
  name: string
  description?: string
  state: StateVar[]
  timers?: Timer[]
  actions: ActionDef[]
  blocks: BlockDef[]
}

export type MessageItem = {
  id: number
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  toolName?: string
}

export type StateVar = {
  id: string
  type: 'number' | 'boolean' | 'log' | 'timestamps' | 'string' | 'array'
  initialValue: number | boolean | LogEntry[] | number[] | string | MessageItem[]
  min?: number
  max?: number
}

export type LogEntry = {
  time: number
  kind: 'allowed' | 'blocked' | 'info' | 'user' | 'assistant' | 'system' | 'tool'
  message: string
  meta?: string
}

export type Timer = {
  intervalMs: number
  action: string
}

export type ActionDef = {
  id: string
  ops: Op[]
}

export type Op =
  | { type: 'set'; target: string; value: unknown }
  | { type: 'increment'; target: string; delta?: number }
  | { type: 'decrement'; target: string; delta?: number }
  | { type: 'reset'; target: string }
  | { type: 'clamp'; target: string; min: number; max: number }
  | { type: 'append-log'; target: string; template: string; kind: 'allowed' | 'blocked' | 'info' | 'user' | 'assistant' | 'system' | 'tool'; fromState?: string }
  | { type: 'append-timestamp'; target: string }
  | { type: 'prune-timestamps'; target: string; windowMs: number }
  | { type: 'set-window-end'; target: string; windowMs: number }
  | { type: 'conditional'; condition: Condition; then: Op[]; else?: Op[] }
  | { type: 'push'; target: string; value: unknown }
  | { type: 'pop'; target: string }
  | { type: 'toggle'; target: string }
  | { type: 'mod'; target: string; modulus: number }
  | { type: 'delay-then'; delayMs: number; ops: Op[] }
  | { type: 'append-message'; target: string; role: string; content?: string; fromState?: string; toolName?: string }
  | { type: 'clear-string'; target: string }
  | { type: 'set-string'; target: string; value: string }
  | { type: 'push-state'; target: string; source: string }

export type Condition = {
  left: string | number
  op: 'lt' | 'lte' | 'gt' | 'gte' | 'eq'
  right: string | number
}

export type BlockType =
  | 'stat' | 'progress-bar' | 'button' | 'event-log'
  | 'slider' | 'text' | 'divider' | 'row' | 'column'
  | 'chat-feed' | 'chat-input' | 'card' | 'grid'
  | 'badge' | 'avatar' | 'tabs' | 'panel'
  | 'code-display' | 'mermaid-block' | 'svg-block' | 'line-chart'
  | 'typing-indicator' | 'image' | 'list-block' | 'split' | 'pill'

export type BlockDef = {
  id: string
  type: BlockType
  props: BlockProps
  children?: BlockDef[]
}

export type BlockProps = {
  label?: string
  value?: string | number
  max?: string | number
  min?: number
  step?: number
  action?: string
  variant?: string
  source?: string
  content?: string
  stateId?: string
  // Layout
  columns?: number
  gap?: string
  // Tabs
  tabLabels?: string[]
  tabContents?: BlockDef[][]
  // Avatar
  role?: string
  // List/grid data
  items?: string
  // Mermaid
  mermaid?: string
  // SVG animation
  svgContent?: string
  animationClass?: string
  frameState?: string
  // Chat blocks
  sendAction?: string
  inputState?: string
  placeholder?: string
  showTimestamps?: boolean
  // Panel/card
  title?: string
  collapsible?: boolean
  // Image
  src?: string
  alt?: string
  width?: string
  height?: string
  // Code display
  language?: string
  // Conditional visibility
  visibleWhen?: string
}

export type DBComponent = {
  id: string
  name: string
  description: string
  definition: string
  status: 'pending' | 'approved' | 'rejected'
  author: string
  created_at: string
  updated_at: string
}
