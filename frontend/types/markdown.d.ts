declare module 'react-markdown' {
  import * as React from 'react';

  export interface ReactMarkdownProps extends React.PropsWithChildren {
    remarkPlugins?: unknown[];
    components?: Record<string, React.ComponentType<any>>;
  }

  export type Components = Record<string, React.ComponentType<any>>;

  const ReactMarkdown: React.FC<ReactMarkdownProps>;

  export default ReactMarkdown;
}

declare module 'remark-gfm' {
  const remarkGfm: unknown;
  export default remarkGfm;
}


