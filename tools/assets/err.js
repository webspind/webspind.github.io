export class ToolError extends Error { constructor(code, detail = "") { super(detail || code); this.code = code; } }
export class CancelError extends Error { constructor() { super("cancelled"); this.code = "cancelled"; } }
