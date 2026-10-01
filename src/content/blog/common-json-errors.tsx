import Link from "next/link";
import { Callout, DataTable, Steps, ToolCta } from "@/components/blog/content";
import type { PostContent } from "@/lib/blog/types";

const content: PostContent = {
  quickAnswer: (
    <p>
      Most JSON errors come from six mistakes: a <strong>trailing comma</strong>, <strong>single quotes</strong>,{" "}
      <strong>unquoted keys</strong>, <strong>comments</strong>, a <strong>missing comma</strong>, or receiving{" "}
      <strong>something that isn&apos;t JSON at all</strong> (an HTML error page, an empty response or <code>undefined</code>). Paste the text
      into a <Link href="/developer-tools/json-formatter">JSON validator</Link> to get the exact line and column, then use the table below to
      match the message to its cause.
    </p>
  ),
  intro: (
    <>
      <p>
        JSON is strict on purpose. It looks like JavaScript, but it accepts far less: no comments, no trailing commas, no single quotes, no{" "}
        <code>undefined</code> or <code>NaN</code>. Anything written by hand — a config file, an API request body, test data — trips over one of
        these sooner or later.
      </p>
      <p>
        The frustrating part is the error message, which usually points at the character <em>after</em> the real mistake and is worded
        differently in every language. Below are the actual messages from JavaScript (Chrome, Edge and Node.js all use the same engine) and
        Python, mapped to what went wrong.
      </p>
    </>
  ),
  sections: [
    {
      id: "error-message-lookup",
      title: "Error message lookup table",
      body: (
        <>
          <DataTable
            caption="What JSON parse errors mean in JavaScript (V8) and Python"
            head={["Cause", "JavaScript says", "Python says"]}
            rows={[
              ["Trailing comma in an object", <code key="a">Expected double-quoted property name</code>, <code key="b">Expecting property name enclosed in double quotes</code>],
              ["Trailing comma in an array", <code key="a">Unexpected token &apos;]&apos;</code>, <code key="b">Expecting value</code>],
              ["Single quotes or unquoted key", <code key="a">Expected property name or &apos;&#125;&apos;</code>, <code key="b">Expecting property name enclosed in double quotes</code>],
              ["Missing comma, or a comment", <code key="a">Expected &apos;,&apos; or &apos;&#125;&apos; after property value</code>, <code key="b">Expecting &apos;,&apos; delimiter</code>],
              ["Empty string or empty response", <code key="a">Unexpected end of JSON input</code>, <code key="b">Expecting value: line 1 column 1 (char 0)</code>],
              ["Got an HTML page instead", <code key="a">Unexpected token &apos;&lt;&apos;, &quot;&lt;!DOCTYPE &quot;...</code>, <code key="b">Expecting value: line 1 column 1 (char 0)</code>],
              ["Parsing the value undefined", <code key="a">&quot;undefined&quot; is not valid JSON</code>, "—"],
              ["Invisible byte-order mark (BOM)", <code key="a">Unexpected token &apos;&#65279;&apos;</code>, <code key="b">Unexpected UTF-8 BOM</code>],
              ["NaN or Infinity", <code key="a">Unexpected token &apos;N&apos;</code>, "Accepted (see below)"],
              ["Raw tab or line break inside a string", <code key="a">Bad control character in string literal</code>, <code key="b">Invalid control character</code>],
            ]}
          />
          <p>
            JavaScript messages also include a position, like <code>at position 7 (line 1 column 8)</code>. Python adds{" "}
            <code>line 1 column 8 (char 7)</code>. Newer Python versions word a few of these differently, but the causes are the same.
          </p>
        </>
      ),
    },
    {
      id: "trailing-commas",
      title: "1. Trailing commas",
      body: (
        <>
          <p>The single most common JSON error, because JavaScript, Python and most config formats allow it and JSON doesn&apos;t:</p>
          <pre>
            <code>{`{
  "name": "Ada",
  "role": "admin",   ← this comma is the problem
}`}</code>
          </pre>
          <p>
            Notice that the error points at the closing <code>&#125;</code>, not the comma. The parser saw a comma, expected another property,
            and found the end instead. Whenever an error points at a closing bracket, look one character back.
          </p>
        </>
      ),
    },
    {
      id: "quotes",
      title: "2. Single quotes and unquoted keys",
      body: (
        <>
          <p>
            JSON strings and keys must use double quotes. <code>&#123;&apos;name&apos;: &apos;Ada&apos;&#125;</code> and{" "}
            <code>&#123;name: &quot;Ada&quot;&#125;</code> are valid JavaScript objects but invalid JSON.
          </p>
          <p>
            This usually happens when someone copies an object from code or prints a Python dictionary with <code>print(data)</code> or{" "}
            <code>str(data)</code> — that produces Python syntax with single quotes. Use <code>json.dumps(data)</code> in Python, or{" "}
            <code>JSON.stringify(data)</code> in JavaScript, to get real JSON.
          </p>
        </>
      ),
    },
    {
      id: "comments",
      title: "3. Comments",
      body: (
        <>
          <p>
            Standard JSON has no comments at all — neither <code>{"// line"}</code> nor <code>{"/* block */"}</code>. Some files <em>look</em> like
            JSON and allow them anyway: VS Code settings and <code>tsconfig.json</code> use a relaxed format often called JSONC. Copy one of
            those into a strict parser and it fails.
          </p>
          <p>
            Remove the comments, or move the information into a real field such as <code>&quot;_note&quot;: &quot;...&quot;</code> if you
            need to keep it.
          </p>
        </>
      ),
    },
    {
      id: "not-json-at-all",
      title: "4. The response isn't JSON at all",
      body: (
        <>
          <p>
            When code calls an API and then parses the response, the most confusing errors aren&apos;t about JSON syntax — the server sent
            something else:
          </p>
          <ul>
            <li>
              <strong>
                <code>Unexpected token &apos;&lt;&apos;</code>
              </strong>{" "}
              means the response starts with <code>&lt;</code> — almost always an HTML page: a 404, a server error, or a login page because
              your session expired.
            </li>
            <li>
              <strong>
                <code>Unexpected end of JSON input</code>
              </strong>{" "}
              means the body was empty, which is normal for a <code>204 No Content</code> response or a request that failed silently.
            </li>
            <li>
              <strong>
                <code>&quot;undefined&quot; is not valid JSON</code>
              </strong>{" "}
              means you passed <code>undefined</code> — often from reading <code>localStorage</code> or a property that doesn&apos;t exist.
            </li>
          </ul>
          <Steps
            items={[
              <>Check the HTTP status code before parsing.</>,
              <>
                Check the <code>Content-Type</code> header is <code>application/json</code>.
              </>,
              <>Log the first couple of hundred characters of the raw text — you&apos;ll see at once whether it&apos;s HTML or empty.</>,
            ]}
          />
        </>
      ),
    },
    {
      id: "nan-and-big-numbers",
      title: "5. NaN, Infinity and very large numbers",
      body: (
        <>
          <p>
            Here&apos;s a trap that catches teams with a Python backend and a JavaScript frontend. Python&apos;s <code>json</code> module
            writes <code>NaN</code> and <code>Infinity</code> by default:
          </p>
          <pre>
            <code>{`json.dumps({"score": float("nan")})   →   {"score": NaN}`}</code>
          </pre>
          <p>
            That isn&apos;t valid JSON, and <code>JSON.parse</code> in the browser rejects it with <code>Unexpected token &apos;N&apos;</code>.
            Pass <code>allow_nan=False</code> to <code>json.dumps</code> to catch it on the server, and send <code>null</code> instead.
          </p>
          <Callout type="warning" title="Large IDs can change silently">
            JSON allows numbers of any size, but JavaScript stores numbers as 64-bit floats and loses precision above 9,007,199,254,740,991. A
            database ID like <code>9007199254740993</code> parses without an error — as a different number. Send large IDs as strings.
          </Callout>
        </>
      ),
    },
    {
      id: "invisible-characters",
      title: "6. Invisible characters",
      body: (
        <>
          <p>When the JSON looks perfect and still fails, suspect something you can&apos;t see:</p>
          <ul>
            <li>
              <strong>A byte-order mark</strong> at the very start, added by some Windows editors. Save the file as “UTF-8” rather than “UTF-8
              with BOM”, or in Python read it with <code>encoding=&quot;utf-8-sig&quot;</code>.
            </li>
            <li>
              <strong>Smart quotes</strong> — <code>“</code> and <code>”</code> instead of <code>&quot;</code> — from text pasted out of a word
              processor or chat app.
            </li>
            <li>
              <strong>Real tabs or line breaks inside a string.</strong> Inside JSON strings they must be written as <code>\t</code> and{" "}
              <code>\n</code>.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: "fix-it-fast",
      title: "Finding the error fast",
      body: (
        <>
          <Steps
            items={[
              <>
                Paste the text into the <Link href="/developer-tools/json-formatter">JSON formatter</Link>. It shows the line and column of the
                first problem.
              </>,
              <>Look at that spot and one character before it — the cause is usually just before where the parser gave up.</>,
              <>Fix it and check again; there may be a second mistake further down.</>,
              <>Once it&apos;s valid, format it with indentation so the next mistake is easier to spot.</>,
            ]}
          />
          <ToolCta tool="developer/json-formatter">Validate JSON with line and column numbers, then format or minify it — nothing is uploaded.</ToolCta>
          <p>
            If you have a working version and a broken one, format both with sorted keys and compare them with{" "}
            <Link href="/text-tools/text-diff">Text Compare</Link> to see exactly what changed.
          </p>
        </>
      ),
    },
  ],
  faqs: [
    { q: "What does 'Unexpected token < in JSON at position 0' mean?", a: "The text starts with <, so it's HTML, not JSON — usually an error page, a 404, or a login page returned by the server. Check the URL, the status code and whether you're still signed in." },
    { q: "Why are trailing commas not allowed in JSON?", a: "JSON was defined as a small, strict subset of JavaScript object syntax in the early 2000s, before trailing commas were common, and the standard was deliberately frozen so every parser behaves the same." },
    { q: "Can JSON have comments?", a: "No. Some tools accept a relaxed variant (JSONC or JSON5) that allows them, but standard parsers reject comments." },
    { q: "How do I fix 'Unexpected end of JSON input'?", a: "The text you parsed was empty or cut off. Check that the request succeeded and returned a body, and that you're not parsing a partially downloaded or truncated file." },
    { q: "Is null valid JSON?", a: "Yes. null, true, false, numbers, strings, arrays and objects are all valid. undefined, NaN and Infinity are not." },
  ],
};

export default content;
