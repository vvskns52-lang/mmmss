const fs=require('node:fs'),path=require('node:path');let html=fs.readFileSync('index.html','utf8');const scripts=[];
html=html.replace(/<script src="([^"]+)" defer><\/script>/g,(_,f)=>{scripts.push(fs.readFileSync(f,'utf8'));return '';});
html=html.replace(/<link rel="stylesheet" href="([^"]+)">/g,(_,f)=>'<style>'+fs.readFileSync(f,'utf8').replace(/@import\s+url\([^;]+;/g,'')+'</style>');
html=html.replace('</body>',()=>'<script>'+scripts.join('\n').replace(/<\/script/gi,'<\\/script')+'</script></body>');
if(/<script[^>]+src=|<link[^>]+stylesheet|@import/.test(html))throw Error('External script or style remains');
const out=path.resolve('..','리듬포켓.html');fs.writeFileSync(out,html);console.log(out+' · '+Buffer.byteLength(html)+' bytes');
