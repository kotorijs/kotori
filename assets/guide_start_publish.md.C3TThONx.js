import{_ as i,c as a,o as n,ae as t}from"./chunks/framework.Dh1jimFm.js";const g=JSON.parse('{"title":"模块发布","description":"","frontmatter":{},"headers":[],"relativePath":"guide/start/publish.md","filePath":"guide/start/publish.md","lastUpdated":1737715772000}'),p={name:"guide/start/publish.md"};function e(l,s,h,k,r,o){return n(),a("div",null,s[0]||(s[0]=[t(`<h1 id="模块发布" tabindex="-1">模块发布 <a class="header-anchor" href="#模块发布" aria-label="Permalink to &quot;模块发布&quot;">​</a></h1><p>当开发完毕模块后，可以将它发布至社区，一个 Kotori 模块一般会同时发布到如下三个平台：</p><ul><li><a href="https://npmjs.org" target="_blank" rel="noreferrer">npmjs.org</a></li><li><a href="./../../modules/">Kotori 模块中心</a></li><li>开源社区：<a href="https://github.com" target="_blank" rel="noreferrer">GitHub</a></li></ul><p>优先级（重要程度）：npm &gt; 模块中心 &gt; 开源社区。每一个公开的 Kotori 模块都应发布至 npm 并作为模块的主要获取途径。Kotori 使用 BCU 协议，该协议要求 Kotori 的所有模块及其二次开发项目也必须使用 BCU 协议且开源，因此发布到开源社区是必要的，开源行为本身也是一种无私奉献、共享知识和回馈社区的体现。</p><h2 id="构建产物" tabindex="-1">构建产物 <a class="header-anchor" href="#构建产物" aria-label="Permalink to &quot;构建产物&quot;">​</a></h2><p>「构建产物」在 JavaScript 生态中指将源码（Kotori 模块开发中一般为 TypeScript 文件）进行处理以适用于生产环境中（处理过程一般有 TypeScript 转为 JavaScript、向下兼容语法、压缩代码等）。JavaScript 生态中构建工具非常多，你可以选择喜欢的构建工具并自习配置，当然如果你对此并不了解也可以使用 Kotori 默认的构建方式（通过 TypeScript 自带的 tsc 程序），在你的模块根目录中输入以下指令：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">pnpm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> build</span></span></code></pre></div><p>一般地，你将会发现在模块根目录出现了一个 <code>lib</code> 文件夹，这在上一节已有提到，它是构建产物的输出目录，有必要的话可在 <code>tsconfig.json</code> 文件中更改：</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">{</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">extends</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">../../tsconfig.base.json</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">compilerOptions</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> {</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">    &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">rootDir</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">./src</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">    &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">outDir</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">./lib</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">  }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">}</span></span></code></pre></div><blockquote><p>关于 <code>tsconfig.json</code> 的更多内容：<a href="https://www.typescriptlang.org/zh/docs/handbook/tsconfig-json.html" target="_blank" rel="noreferrer">TypeScript Documentation</a></p></blockquote><h2 id="文件忽略" tabindex="-1">文件忽略 <a class="header-anchor" href="#文件忽略" aria-label="Permalink to &quot;文件忽略&quot;">​</a></h2><p>对于模块发布主要分为发布构建产物（publish）与推送源码（push），两种情况下需要发布的文件内容会有些许不同，因此便引入了「文件忽略」。</p><h3 id="npmignore" tabindex="-1">.npmignore <a class="header-anchor" href="#npmignore" aria-label="Permalink to &quot;.npmignore&quot;">​</a></h3><p>用于指定在发布构建产物时忽略的文件与文件夹，在模块根目录创建一个 <code>.npmignore</code> 文件：</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span>node_modules</span></span>
<span class="line"><span>src</span></span>
<span class="line"><span>test</span></span>
<span class="line"><span></span></span>
<span class="line"><span>tsconfig.json</span></span>
<span class="line"><span>!README.md</span></span></code></pre></div><p>实际上在发布构建产物时只需要附带少数文件即可，而 <code>.npmignore</code> 采用的是黑名单机制显得很繁琐，因此 Kotori 模块的默认模板中并未使用该方式，也并不推荐。</p><h3 id="package-files" tabindex="-1">package.files <a class="header-anchor" href="#package-files" aria-label="Permalink to &quot;package.files&quot;">​</a></h3><p>在上一节的 <code>package.json</code> 示例中会发现有一个以字符串数组为值的 <code>files</code> 配置项，其用于指定在使用 <code>publish</code> 时需要附带的文件与文件夹。</p><div class="language-json vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">json</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">{</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">name</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">kotori-plugin-my-project</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">version</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">1.0.0</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">description</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">a kotori project kotori project</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">main</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">lib/index.js</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">keywords</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> [</span></span>
<span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">kotori</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">chatbot</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">kotori-plugin</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">  ],</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">license</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">BAN-ZHINESE-USING</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line highlighted"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">files</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> [</span></span>
<span class="line highlighted"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">lib</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line highlighted"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">locales</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line highlighted"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">LICENSE</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line highlighted"><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">    &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">README.md</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line highlighted"><span style="--shiki-light:#999999;--shiki-dark:#666666;">  ],</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">author</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">Himeno</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">,</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">  &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">peerDependencies</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#999999;--shiki-dark:#666666;"> {</span></span>
<span class="line"><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">    &quot;</span><span style="--shiki-light:#998418;--shiki-dark:#B8A965;">kotori-bot</span><span style="--shiki-light:#99841877;--shiki-dark:#B8A96577;">&quot;</span><span style="--shiki-light:#999999;--shiki-dark:#666666;">:</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &quot;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">^1.7.1</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&quot;</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">  }</span></span>
<span class="line"><span style="--shiki-light:#999999;--shiki-dark:#666666;">}</span></span></code></pre></div><p><code>files</code> 配置项优先级高于 <code>.npmignore</code>，其直接写在 <code>package.json</code> 中显得十分简洁也会减少整个模块目录的文件冗余。</p><h3 id="gitignore" tabindex="-1">.gitignore <a class="header-anchor" href="#gitignore" aria-label="Permalink to &quot;.gitignore&quot;">​</a></h3><p>不同于前两者，<code>.gitignore</code> 用于指定在使用 Git 进行版本控制时需要忽略的文件，语法与 <code>.npmignore</code> 类似，同样位于模块根目录：</p><div class="language-gitignore vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">gitignore</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span>node_modules</span></span>
<span class="line"><span>dist</span></span>
<span class="line"><span>lib</span></span>
<span class="line"><span>coverage</span></span>
<span class="line"><span>log</span></span>
<span class="line"><span>cache</span></span>
<span class="line"><span>temp</span></span>
<span class="line"><span>data</span></span>
<span class="line"><span>data.db</span></span>
<span class="line"><span></span></span>
<span class="line"><span>*.env</span></span>
<span class="line"><span>.env</span></span>
<span class="line"><span>*.tgz</span></span>
<span class="line"><span>*.log</span></span>
<span class="line"><span>tsconfig.tsbuildinfo</span></span>
<span class="line"><span>test.http</span></span>
<span class="line"><span></span></span>
<span class="line"><span>kotori.dev.*</span></span>
<span class="line"><span>*.res.js</span></span></code></pre></div><h2 id="发布构建产物" tabindex="-1">发布构建产物 <a class="header-anchor" href="#发布构建产物" aria-label="Permalink to &quot;发布构建产物&quot;">​</a></h2><p>使用工作区开发时，需确保当前为待发布模块根目录，而非工作区根目录。首先检查 npm 源是否为 <code>http://registry.npmjs.org</code>：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">npm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> config</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> get</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> registry</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># If not:</span></span>
<span class="line"><span style="--shiki-light:#A0ADA0;--shiki-dark:#758575DD;"># npm config set registry=http://registry.npmjs.org</span></span></code></pre></div><p>前往 <a href="https://npmjs.org" target="_blank" rel="noreferrer">npmjs.org</a> 注册账号，然后根据提示在浏览器内登录：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">npm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> login</span></span></code></pre></div><p>当一切就绪时：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">npm</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> publish</span></span></code></pre></div><p>当没有任何意外问题时，访问 npm 个人页即可查看刚才发布的插件： <a href="https://www.npmjs.com/package/kotori-plugin-my-project" target="_blank" rel="noreferrer">kotori-plugin-my-project</a>。</p><h2 id="发布源码" tabindex="-1">发布源码 <a class="header-anchor" href="#发布源码" aria-label="Permalink to &quot;发布源码&quot;">​</a></h2><p>使用 Git 前务必先配置好你的账号、邮箱和与 GitHub 通信的 ssh，可参考 <a href="https://www.cnblogs.com/techflow/p/13703721.html" target="_blank" rel="noreferrer">手把手教你配置 git 和 git 仓库</a>。使用工作区开发时，可选择发布整个工作区也可仅发布单个模块，切换到相应目录即可。首先在 <a href="https://github.com" target="_blank" rel="noreferrer">GitHub New</a> 页面创建一个远程仓库，接着在本地仓库中关联到该远程仓库：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> remote</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> add</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> origin</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> git@github.com:kotorijs/kotori-plugin-my-project</span></span></code></pre></div><p>提交并推送至远程仓库</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> add</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> .</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> commit</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> -m</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;"> &#39;</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;">feat: create a project</span><span style="--shiki-light:#B5695977;--shiki-dark:#C98A7D77;">&#39;</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> push</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> origin</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> master</span></span></code></pre></div><p>当然，你也可以为本次提交添加一个 tag：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes vitesse-light vitesse-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> tag</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> v1.0.0</span></span>
<span class="line"><span style="--shiki-light:#59873A;--shiki-dark:#80A665;">git</span><span style="--shiki-light:#B56959;--shiki-dark:#C98A7D;"> push</span><span style="--shiki-light:#A65E2B;--shiki-dark:#C99076;"> --tags</span></span></code></pre></div><h2 id="收录至模块市场" tabindex="-1">收录至模块市场 <a class="header-anchor" href="#收录至模块市场" aria-label="Permalink to &quot;收录至模块市场&quot;">​</a></h2><p>模块市场是 Kotori 官方维护的模块仓库，目前通过自动化流程从 npm 上查找所有符合条件的包，只要你的包符合规范并发布到 npm，将会在半小时内自动同步到模块市场。</p><h2 id="放在最后" tabindex="-1">放在最后 <a class="header-anchor" href="#放在最后" aria-label="Permalink to &quot;放在最后&quot;">​</a></h2><ul><li>对于项目的版本号应遵循 <a href="https://semver.org/lang/zh-CN/" target="_blank" rel="noreferrer">语义化版本 2.0.0</a>。</li><li>有必要使用一些用于提高代码质量的格式化工具：<a href="https://eslint.org/" target="_blank" rel="noreferrer">ESLint</a>、<a href="https://prettier.io/" target="_blank" rel="noreferrer">Prettier</a>。</li><li>Git 提交信息应遵循 <a href="https://zj-git-guide.readthedocs.io/zh-cn/latest/message/Angular%E6%8F%90%E4%BA%A4%E4%BF%A1%E6%81%AF%E8%A7%84%E8%8C%83/" target="_blank" rel="noreferrer">Angular 规范</a></li></ul>`,42)]))}const c=i(p,[["render",e]]);export{g as __pageData,c as default};
