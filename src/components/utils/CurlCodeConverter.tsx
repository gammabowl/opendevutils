import { useMemo, useState } from "react";
import { BookOpen, TerminalSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

type Target = "fetch" | "axios" | "python" | "go" | "php" | "ruby" | "java" | "csharp";
type RequestData = { url: string; method: string; headers: Record<string, string>; body?: string };

const examples = [
  {
    method: "GET",
    description: "Fetch a list of users",
    query: "page=1 · limit=10 · sort=name",
    command: `curl 'https://api.example.com/users?page=1&limit=10&sort=name' \\
  -H 'Accept: application/json'`,
  },
  {
    method: "POST",
    description: "Create a new user",
    query: "send_welcome=true",
    command: `curl 'https://api.example.com/users?send_welcome=true' \\
  -X POST \\
  -H 'Authorization: Bearer token' \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"name":"Ada","role":"developer"}'`,
  },
  {
    method: "PUT",
    description: "Replace an existing user",
    query: "version=2",
    command: `curl 'https://api.example.com/users/42?version=2' \\
  -X PUT \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"name":"Grace","role":"engineer"}'`,
  },
  {
    method: "PATCH",
    description: "Update one field",
    query: "audit=true",
    command: `curl 'https://api.example.com/users/42?audit=true' \\
  -X PATCH \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"role":"admin"}'`,
  },
  {
    method: "DELETE",
    description: "Delete a user",
    query: "permanent=false",
    command: `curl 'https://api.example.com/users/42?permanent=false' \\
  -X DELETE \\
  -H 'Authorization: Bearer token'`,
  },
];

const example = examples[1].command;

function tokenize(command: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote = "";
  let escaped = false;
  for (let i = 0; i < command.length; i += 1) {
    const char = command[i];
    if (escaped) {
      if (char !== "\n") current += char;
      escaped = false;
    } else if (char === "\\") {
      escaped = true;
    } else if (quote) {
      if (char === quote) quote = "";
      else current += char;
    } else if (char === "'" || char === '"') {
      quote = char;
    } else if (/\s/.test(char)) {
      if (current) tokens.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  if (quote) throw new Error("The cURL command contains an unclosed quote.");
  if (current) tokens.push(current);
  return tokens;
}

function parseCurl(command: string): RequestData {
  const tokens = tokenize(command.trim());
  if (tokens[0] !== "curl") throw new Error("Enter a command beginning with curl.");
  const headers: Record<string, string> = {};
  let url = "";
  let method = "";
  let body: string | undefined;
  const valueFlags = new Set(["-X", "--request", "-H", "--header", "-d", "--data", "--data-raw", "--data-binary", "-u", "--user", "-A", "--user-agent"]);

  for (let i = 1; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (valueFlags.has(token)) {
      const value = tokens[++i];
      if (value === undefined) throw new Error(`${token} requires a value.`);
      if (token === "-X" || token === "--request") method = value.toUpperCase();
      else if (token === "-H" || token === "--header") {
        const separator = value.indexOf(":");
        if (separator < 1) throw new Error(`Invalid header: ${value}`);
        headers[value.slice(0, separator).trim()] = value.slice(separator + 1).trim();
      } else if (["-d", "--data", "--data-raw", "--data-binary"].includes(token)) body = value;
      else if (token === "-u" || token === "--user") headers.Authorization = `Basic ${btoa(value)}`;
      else headers["User-Agent"] = value;
    } else if (token === "-I" || token === "--head") method = "HEAD";
    else if (!token.startsWith("-")) url = token;
  }
  if (!url) throw new Error("No request URL was found.");
  return { url, method: method || (body === undefined ? "GET" : "POST"), headers, body };
}

const js = (value: string) => JSON.stringify(value);

function generateCode(request: RequestData, target: Target): string {
  const headerEntries = Object.entries(request.headers);
  const headers = JSON.stringify(request.headers, null, 2);
  if (target === "fetch") {
    const options = [`method: ${js(request.method)}`];
    if (headerEntries.length) options.push(`headers: ${headers.replace(/\n/g, "\n  ")}`);
    if (request.body !== undefined) options.push(`body: ${js(request.body)}`);
    return `const response = await fetch(${js(request.url)}, {\n  ${options.join(",\n  ")}\n});\n\nconst data = await response.json();`;
  }
  if (target === "axios") {
    const lines = [`method: ${js(request.method.toLowerCase())}`, `url: ${js(request.url)}`];
    if (headerEntries.length) lines.push(`headers: ${headers.replace(/\n/g, "\n  ")}`);
    if (request.body !== undefined) lines.push(`data: ${js(request.body)}`);
    return `import axios from "axios";\n\nconst response = await axios({\n  ${lines.join(",\n  ")}\n});\n\nconsole.log(response.data);`;
  }
  if (target === "python") {
    const args = [`${js(request.url)}`];
    if (headerEntries.length) args.push(`headers=${headers.replace(/\btrue\b/g, "True").replace(/\bfalse\b/g, "False")}`);
    if (request.body !== undefined) args.push(`data=${js(request.body)}`);
    return `import requests\n\nresponse = requests.${request.method.toLowerCase()}(\n    ${args.join(",\n    ")}\n)\nresponse.raise_for_status()\nprint(response.json())`;
  }
  if (target === "php") {
    const php = (value: string) => `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
    const options = [`CURLOPT_URL => ${php(request.url)}`, "CURLOPT_RETURNTRANSFER => true", `CURLOPT_CUSTOMREQUEST => ${php(request.method)}`];
    if (headerEntries.length) options.push(`CURLOPT_HTTPHEADER => [\n        ${headerEntries.map(([key, value]) => php(`${key}: ${value}`)).join(",\n        ")}\n    ]`);
    if (request.body !== undefined) options.push(`CURLOPT_POSTFIELDS => ${php(request.body)}`);
    return `<?php\n\n$curl = curl_init();\n\ncurl_setopt_array($curl, [\n    ${options.join(",\n    ")}\n]);\n\n$response = curl_exec($curl);\nif ($response === false) {\n    throw new RuntimeException(curl_error($curl));\n}\n\ncurl_close($curl);\necho $response;`;
  }
  if (target === "ruby") {
    const headerLines = headerEntries.map(([key, value]) => `request[${js(key)}] = ${js(value)}`).join("\n");
    return `require "net/http"\nrequire "uri"\n\nuri = URI(${js(request.url)})\nrequest = Net::HTTPGenericRequest.new(${js(request.method)}, ${request.body === undefined ? "false" : "true"}, true, uri.request_uri)${headerLines ? `\n${headerLines}` : ""}${request.body === undefined ? "" : `\nrequest.body = ${js(request.body)}`}\n\nresponse = Net::HTTP.start(uri.hostname, uri.port, use_ssl: uri.scheme == "https") do |http|\n  http.request(request)\nend\n\nputs response.body`;
  }
  if (target === "java") {
    const headerLines = headerEntries.map(([key, value]) => `.header(${js(key)}, ${js(value)})`).join("\n            ");
    const publisher = request.body === undefined ? "HttpRequest.BodyPublishers.noBody()" : `HttpRequest.BodyPublishers.ofString(${js(request.body)})`;
    return `import java.net.URI;\nimport java.net.http.HttpClient;\nimport java.net.http.HttpRequest;\nimport java.net.http.HttpResponse;\n\npublic class ApiRequest {\n    public static void main(String[] args) throws Exception {\n        HttpRequest request = HttpRequest.newBuilder()\n            .uri(URI.create(${js(request.url)}))${headerLines ? `\n            ${headerLines}` : ""}\n            .method(${js(request.method)}, ${publisher})\n            .build();\n\n        HttpResponse<String> response = HttpClient.newHttpClient().send(\n            request, HttpResponse.BodyHandlers.ofString()\n        );\n        System.out.println(response.body());\n    }\n}`;
  }
  if (target === "csharp") {
    const headerLines = headerEntries.map(([key, value]) => `request.Headers.TryAddWithoutValidation(${js(key)}, ${js(value)});`).join("\n");
    return `using System.Net.Http;\nusing System.Text;\n\nusing var client = new HttpClient();\nusing var request = new HttpRequestMessage(new HttpMethod(${js(request.method)}), ${js(request.url)});${headerLines ? `\n${headerLines}` : ""}${request.body === undefined ? "" : `\nrequest.Content = new StringContent(${js(request.body)}, Encoding.UTF8);`}\n\nusing var response = await client.SendAsync(request);\nresponse.EnsureSuccessStatusCode();\nConsole.WriteLine(await response.Content.ReadAsStringAsync());`;
  }
  const body = request.body === undefined ? "nil" : `strings.NewReader(${js(request.body)})`;
  const headerLines = headerEntries.map(([key, value]) => `req.Header.Set(${js(key)}, ${js(value)})`).join("\n");
  return `package main\n\nimport (\n    "fmt"\n    "io"\n    "net/http"${request.body === undefined ? "" : '\n    "strings"'}\n)\n\nfunc main() {\n    req, err := http.NewRequest(${js(request.method)}, ${js(request.url)}, ${body})\n    if err != nil { panic(err) }${headerLines ? `\n    ${headerLines.replace(/\n/g, "\n    ")}` : ""}\n\n    resp, err := http.DefaultClient.Do(req)\n    if err != nil { panic(err) }\n    defer resp.Body.Close()\n\n    data, err := io.ReadAll(resp.Body)\n    if err != nil { panic(err) }\n    fmt.Println(string(data))\n}`;
}

export function CurlCodeConverter() {
  const [input, setInput] = useState(example);
  const [target, setTarget] = useState<Target>("fetch");
  const result = useMemo(() => {
    try { return { code: generateCode(parseCurl(input), target), error: "" }; }
    catch (error) { return { code: "", error: error instanceof Error ? error.message : "Unable to parse this command." }; }
  }, [input, target]);

  return (
    <Card className="tool-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <TerminalSquare className="h-5 w-5 text-stone-600 dark:text-stone-400" />
            cURL to Code Converter
          </CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                <BookOpen className="h-3.5 w-3.5" />
                Examples
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[min(26rem,calc(100vw-2rem))] p-3" align="end">
              <div className="space-y-1">
                {examples.map((item) => (
                  <div key={item.method} className="flex items-center justify-between gap-2 rounded-md bg-muted/50 p-2">
                    <div className="min-w-0">
                      <div className="font-mono text-sm font-medium text-foreground">{item.method}</div>
                      <div className="text-xs text-muted-foreground">{item.description}</div>
                      <div className="mt-1 truncate font-mono text-[11px] text-muted-foreground/80">
                        Query: {item.query}
                      </div>
                    </div>
                    <Button onClick={() => setInput(item.command)} variant="outline" size="sm" className="h-7 flex-shrink-0 text-xs">
                      Use
                    </Button>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-2">
          <div className="flex h-10 items-center justify-between">
            <label className="text-sm font-medium">cURL command</label>
          </div>
          <Textarea value={input} onChange={(event) => setInput(event.target.value)} spellCheck={false} className="min-h-[440px] resize-y font-mono text-sm" placeholder="Paste a cURL command…" />
          {result.error && <p className="text-sm text-destructive">{result.error}</p>}
        </div>
        <div className="space-y-2">
          <div className="flex h-10 items-center justify-between gap-3">
            <Select value={target} onValueChange={(value) => setTarget(value as Target)}>
              <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fetch">JavaScript — Fetch</SelectItem>
                <SelectItem value="axios">JavaScript — Axios</SelectItem>
                <SelectItem value="python">Python — Requests</SelectItem>
                <SelectItem value="go">Go — net/http</SelectItem>
                <SelectItem value="php">PHP — cURL</SelectItem>
                <SelectItem value="ruby">Ruby — Net::HTTP</SelectItem>
                <SelectItem value="java">Java — HttpClient</SelectItem>
                <SelectItem value="csharp">C# — HttpClient</SelectItem>
              </SelectContent>
            </Select>
            <CopyButton text={result.code} title="Copy generated code" />
          </div>
          <Textarea value={result.code} readOnly spellCheck={false} className="min-h-[440px] resize-y bg-muted/40 font-mono text-sm" placeholder="Generated code will appear here" />
        </div>
      </CardContent>
    </Card>
  );
}
