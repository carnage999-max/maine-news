import React from 'react';
import Markdoc from '@markdoc/markdoc';

interface ArticleContentProps {
    content: string;
}

function looksLikeHtml(content: string) {
    return /<\/?[a-z][\s\S]*>/i.test(content);
}

export default function ArticleContent({ content }: ArticleContentProps) {
    if (looksLikeHtml(content)) {
        return <div dangerouslySetInnerHTML={{ __html: content }} />;
    }

    const ast = Markdoc.parse(content);
    const transformed = Markdoc.transform(ast);
    const rendered = Markdoc.renderers.react(transformed, React);

    return <>{rendered}</>;
}
