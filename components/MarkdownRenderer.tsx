import React from 'react';

interface MarkdownRendererProps {
  content: string;
}

const parseInlineText = (text: string): React.ReactNode[] => {
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;

  // Fix: Correctly structured regex for capturing different markdown inline elements.
  const regex = /(\*\*(.*?)\*\*)|(_(.*?)_)|(\*(.*?)\*)|(`(.*?)`)|(\[(.*?)\]\((.*?)\))/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add plain text before the match
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    const [
      , // full match
      , // **...**
      boldContent, // group 2
      , // _..._
      italicContent1, // group 4
      , // *...*
      italicContent2, // group 6
      , // `...`
      inlineCodeContent, // group 8
      , // [...]
      linkText, // group 10
      linkUrl, // group 11
    ] = match;

    if (boldContent !== undefined) {
      elements.push(<strong key={match.index}>{boldContent}</strong>);
    } else if (italicContent1 !== undefined) {
      elements.push(<em key={match.index}>{italicContent1}</em>);
    } else if (italicContent2 !== undefined) {
      elements.push(<em key={match.index}>{italicContent2}</em>);
    } else if (inlineCodeContent !== undefined) {
      elements.push(<code key={match.index} className="px-1 py-0.5 bg-[#45475A] text-[#F5C2E7] rounded text-sm">{inlineCodeContent}</code>);
    } else if (linkText !== undefined && linkUrl !== undefined) {
      elements.push(<a href={linkUrl} key={match.index} target="_blank" rel="noopener noreferrer" className="text-[#94E2D5] hover:underline">{linkText}</a>);
    }

    lastIndex = regex.lastIndex;
  }

  // Add any remaining plain text
  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }
  
  return elements;
};

// Fix: Rewrote the component's parsing logic to be more robust and correct.
// The previous implementation was buggy and caused multiple compilation errors.
// This new version iterates through lines and correctly groups multi-line elements like lists and code blocks.
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let i = 0;

    // Skip YAML front matter
    if (lines[0] && lines[0].trim() === '---') {
        i = 1;
        while (i < lines.length && lines[i].trim() !== '---') {
            i++;
        }
        i++; // Skip the closing '---'
    }

    while (i < lines.length) {
        const line = lines[i];

        if (line.startsWith('```')) {
            const codeLines = [];
            i++;
            while (i < lines.length && !lines[i].startsWith('```')) {
                codeLines.push(lines[i]);
                i++;
            }
            elements.push(
                <pre key={`code-${i}`} className="bg-[#181825] p-4 rounded-md overflow-x-auto my-4 border border-[#313244]">
                    <code className="text-sm font-mono text-[#A6E3A1]">{codeLines.join('\n')}</code>
                </pre>
            );
            if (i < lines.length) i++; // Consume the closing ```
            continue;
        }

        if (line.startsWith('# ')) {
            elements.push(<h1 key={i} className="text-3xl font-bold mt-6 mb-3 border-b border-[#45475A] pb-2 text-[#CBA6F7]">{parseInlineText(line.substring(2))}</h1>);
            i++; continue;
        }
        if (line.startsWith('## ')) {
            elements.push(<h2 key={i} className="text-2xl font-bold mt-6 mb-3 border-b border-[#313244] pb-2 text-[#89B4FA]">{parseInlineText(line.substring(3))}</h2>);
            i++; continue;
        }
        if (line.startsWith('### ')) {
            elements.push(<h3 key={i} className="text-xl font-bold mt-5 mb-2 text-[#94E2D5]">{parseInlineText(line.substring(4))}</h3>);
            i++; continue;
        }
        if (line.startsWith('#### ')) {
            elements.push(<h4 key={i} className="text-lg font-bold mt-4 mb-2 text-[#FAB387]">{parseInlineText(line.substring(5))}</h4>);
            i++; continue;
        }

        if (line.trim().startsWith('>')) {
            elements.push(<blockquote key={i} className="border-l-4 border-[#585B70] pl-4 italic text-[#A6ADC8] my-4">{parseInlineText(line.replace(/^>\s?/, ''))}</blockquote>);
            i++; continue;
        }

        const isUl = line.trim().startsWith('- ') || line.trim().startsWith('* ');
        const isOl = /^\s*\d+\.\s/.test(line);

        if (isUl || isOl) {
            const listItems = [];
            const listType = isUl ? 'ul' : 'ol';
            const listStartIndex = i;

            while (i < lines.length) {
                const currentLine = lines[i];
                const currentIsUl = currentLine.trim().startsWith('- ') || currentLine.trim().startsWith('* ');
                const currentIsOl = /^\s*\d+\.\s/.test(currentLine);

                if ((listType === 'ul' && currentIsUl) || (listType === 'ol' && currentIsOl)) {
                    const itemContent = currentLine.replace(/^\s*(\-|\*|\d+\.)\s/, '');
                    listItems.push(<li key={`item-${i}`}>{parseInlineText(itemContent)}</li>);
                    i++;
                } else {
                    break;
                }
            }
            
            if (listType === 'ul') {
                elements.push(<ul key={`list-${listStartIndex}`} className="list-disc list-inside space-y-2 mb-4 pl-4">{listItems}</ul>);
            } else {
                elements.push(<ol key={`list-${listStartIndex}`} className="list-decimal list-inside space-y-2 mb-4 pl-4">{listItems}</ol>);
            }
            continue;
        }
        
        if (line.trim() !== '') {
            elements.push(<p key={i} className="my-2 leading-relaxed">{parseInlineText(line)}</p>);
        }

        i++;
    }

    return <div className="prose-styles">{elements}</div>;
};

export default MarkdownRenderer;
