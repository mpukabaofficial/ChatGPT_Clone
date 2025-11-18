import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";

interface MessageTextProps {
  content: string;
  role: "user" | "assistant";
}

const MessageText = ({ content, role }: MessageTextProps) => {
  if (role === "user") {
    return (
      <div className="max-w-2xl p-4 rounded-lg bg-slate-600 text-white ml-auto">
        <div className="whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-6 p-6 bg-slate-900/50 rounded-xl max-w-2xl backdrop-blur-sm border border-slate-800/50 shadow-lg">
      <div className="prose prose-invert prose-slate max-w-none
                      prose-headings:font-semibold prose-headings:tracking-tight
                      prose-h1:text-3xl prose-h1:mb-4 prose-h1:text-slate-100
                      prose-h2:text-2xl prose-h2:mb-3 prose-h2:text-slate-200
                      prose-h3:text-xl prose-h3:mb-2 prose-h3:text-slate-200
                      prose-p:text-slate-300 prose-p:leading-7 prose-p:mb-4
                      prose-strong:text-slate-100 prose-strong:font-semibold
                      prose-em:text-slate-300 prose-em:italic
                      prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                      prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                      prose-li:text-slate-300 prose-li:my-1 prose-li:leading-7
                      prose-blockquote:border-l-4 prose-blockquote:border-cyan-500
                      prose-blockquote:pl-4 prose-blockquote:italic
                      prose-blockquote:text-slate-400 prose-blockquote:my-4
                      prose-code:text-cyan-400 prose-code:bg-slate-800
                      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
                      prose-code:text-sm prose-code:font-mono
                      prose-code:before:content-[''] prose-code:after:content-['']
                      prose-pre:bg-transparent prose-pre:p-0 prose-pre:m-0
                      prose-a:text-cyan-400 prose-a:no-underline prose-a:font-medium
                      hover:prose-a:text-cyan-300 hover:prose-a:underline
                      prose-img:rounded-lg prose-img:shadow-md
                      prose-hr:border-slate-700 prose-hr:my-6
                      prose-table:border-collapse prose-table:w-full
                      prose-th:bg-slate-800 prose-th:text-slate-200
                      prose-th:font-semibold prose-th:p-3 prose-th:border
                      prose-th:border-slate-700
                      prose-td:p-3 prose-td:border prose-td:border-slate-700
                      prose-td:text-slate-300">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Enhanced code block rendering with syntax highlighting
            code(props) {
              const { children, className } = props;
              const match = /language-(\w+)/.exec(className || "");
              const codeString = String(children).replace(/\n$/, "");
              const isInline = !className?.includes("language-");

              return !isInline && match ? (
                <div className="relative group my-4">
                  <div className="absolute -top-3 left-3 bg-slate-700 text-slate-300 text-xs px-3 py-1 rounded-t-md font-mono border-b border-slate-600">
                    {match[1]}
                  </div>
                  <div className="rounded-lg overflow-hidden shadow-xl border border-slate-700">
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language={match[1]}
                      PreTag="div"
                      customStyle={{
                        margin: 0,
                        padding: "1.5rem",
                        fontSize: "0.875rem",
                        lineHeight: "1.7",
                        background: "#0f172a",
                        borderRadius: "0.5rem",
                      }}
                      codeTagProps={{
                        style: {
                          fontFamily:
                            "'SF Mono', 'Fira Code', 'Consolas', monospace",
                        },
                      }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(codeString);
                    }}
                    className="absolute top-8 right-3 opacity-0 group-hover:opacity-100
                             bg-slate-700 hover:bg-slate-600 text-slate-300
                             text-xs px-3 py-1.5 rounded transition-all duration-200
                             border border-slate-600 hover:border-slate-500"
                    title="Copy code"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <code className="bg-slate-800 text-cyan-400 px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            },
            // Enhanced link styling
            a: (props) => (
              <a
                {...props}
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30
                         hover:decoration-cyan-300 transition-colors duration-200 font-medium"
              />
            ),
            // Enhanced blockquote
            blockquote: (props) => (
              <blockquote
                {...props}
                className="border-l-4 border-cyan-500 pl-4 py-2 my-4
                         bg-slate-800/30 rounded-r italic text-slate-400"
              />
            ),
            // Enhanced table
            table: (props) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-slate-700 shadow-md">
                <table {...props} className="min-w-full border-collapse" />
              </div>
            ),
            thead: (props) => <thead {...props} className="bg-slate-800" />,
            th: (props) => (
              <th
                {...props}
                className="px-4 py-3 text-left text-slate-200 font-semibold
                         border-b-2 border-slate-600 text-sm"
              />
            ),
            td: (props) => (
              <td
                {...props}
                className="px-4 py-3 text-slate-300 border-b border-slate-700 text-sm"
              />
            ),
            tbody: (props) => (
              <tbody {...props} className="divide-y divide-slate-700" />
            ),
            tr: (props) => (
              <tr
                {...props}
                className="hover:bg-slate-800/50 transition-colors duration-150"
              />
            ),
            // Enhanced lists
            ul: (props) => (
              <ul
                {...props}
                className="my-4 space-y-2 list-disc pl-6 text-slate-300"
              />
            ),
            ol: (props) => (
              <ol
                {...props}
                className="my-4 space-y-2 list-decimal pl-6 text-slate-300"
              />
            ),
            li: (props) => <li {...props} className="leading-7 text-slate-300" />,
            // Enhanced horizontal rule
            hr: (props) => (
              <hr
                {...props}
                className="my-6 border-t border-slate-700 opacity-50"
              />
            ),
            // Enhanced headings
            h1: (props) => (
              <h1
                {...props}
                className="text-3xl font-semibold text-slate-100 mb-4 mt-6
                         tracking-tight border-b border-slate-700 pb-2"
              />
            ),
            h2: (props) => (
              <h2
                {...props}
                className="text-2xl font-semibold text-slate-200 mb-3 mt-5 tracking-tight"
              />
            ),
            h3: (props) => (
              <h3
                {...props}
                className="text-xl font-semibold text-slate-200 mb-2 mt-4"
              />
            ),
            h4: (props) => (
              <h4
                {...props}
                className="text-lg font-semibold text-slate-200 mb-2 mt-3"
              />
            ),
            // Enhanced paragraph
            p: (props) => <p {...props} className="text-slate-300 leading-7 mb-4" />,
            // Enhanced image
            img: (props) => (
              <img
                {...props}
                className="rounded-lg shadow-lg my-4 max-w-full h-auto border border-slate-700"
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </section>
  );
};

export default MessageText;
