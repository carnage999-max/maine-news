import React from 'react';
import Markdoc from '@markdoc/markdoc';

interface MarkdocRendererProps {
    content: { node: any };
}

export default function MarkdocRenderer({ content }: MarkdocRendererProps) {
    const { node } = content;

    // Render the Markdoc AST to React elements on the server
    const renderedContent = Markdoc.renderers.react(node, React);

    return <>{renderedContent}</>;
}
