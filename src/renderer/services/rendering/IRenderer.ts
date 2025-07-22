export interface IRenderer {
  render(latex: string, options?: any): Promise<string>;
}