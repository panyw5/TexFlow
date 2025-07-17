export class LaTeXSanitizer {
  private static readonly DANGEROUS_COMMANDS = [
    '\\input', '\\include', '\\write', '\\immediate',
    '\\openin', '\\openout', '\\read', '\\catcode'
  ];
  
  private static readonly ALLOWED_COMMANDS = new Set([
    'frac', 'sqrt', 'sum', 'int', 'lim', 'begin', 'end',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon'
    // Add more safe commands
  ]);
  
  static sanitize(input: string): string {
    // Remove dangerous commands
    let sanitized = input;
    
    this.DANGEROUS_COMMANDS.forEach(cmd => {
      const regex = new RegExp(`\\\\${cmd.slice(1)}\\b`, 'gi');
      sanitized = sanitized.replace(regex, '');
    });
    
    // Validate command usage
    const commandRegex = /\\([a-zA-Z]+)/g;
    let match;
    
    while ((match = commandRegex.exec(sanitized)) !== null) {
      const command = match[1];
      if (!this.ALLOWED_COMMANDS.has(command)) {
        console.warn(`Potentially unsafe command: \\${command}`);
      }
    }
    
    return sanitized;
  }
}