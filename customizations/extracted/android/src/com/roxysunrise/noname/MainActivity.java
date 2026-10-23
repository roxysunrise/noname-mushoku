package com.roxysunrise.noname;

import android.app.*;
import android.content.*;
import android.content.res.AssetManager;
import android.net.Uri;
import android.os.Bundle;
import android.os.Build;
import android.view.*;
import android.graphics.Insets;
import android.widget.FrameLayout;
import android.webkit.*;
import android.webkit.JavascriptInterface;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.*;
import java.util.zip.*;
import org.json.*;

/** Offline game assets with the same HTTP filesystem contract as the desktop browser build. */
public final class MainActivity extends Activity {
    private WebView web;
    private FrameLayout gameFrame;
    private LocalServer server;
    private static final int PORT = 18765;
    private int safeLeft, safeTop, safeRight, safeBottom;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        try {
            server = new LocalServer(getAssets(), getFilesDir());
            server.start();
        } catch (IOException error) {
            new AlertDialog.Builder(this).setMessage("本地游戏服务无法启动："+error.getMessage()).setPositiveButton("退出",(d,w)->finish()).show();
            return;
        }
        web = new WebView(this);
        gameFrame = new FrameLayout(this);
        gameFrame.addView(web, new FrameLayout.LayoutParams(-1,-1));
        setContentView(gameFrame);
        configureGameWindow();
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setMediaPlaybackRequiresUserGesture(false);
        // The game is served from HTTP loopback; Sakura's TCP websocket endpoint uses ws://.
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        web.addJavascriptInterface(new AndroidUpdateBridge(),"NonameUpdater");
        web.setWebViewClient(new WebViewClient() {
            @Override public void onPageFinished(WebView view, String url) { publishSafeArea(); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri=request.getUrl();
                return !("http".equals(uri.getScheme()) && "127.0.0.1".equals(uri.getHost()) && uri.getPort()==PORT);
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onJsAlert(WebView view,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("确定",(d,w)->result.confirm()).setOnCancelListener(d->result.cancel()).show();return true;
            }
            @Override public boolean onJsConfirm(WebView view,String url,String message,JsResult result) {
                new AlertDialog.Builder(MainActivity.this).setMessage(message).setPositiveButton("确定",(d,w)->result.confirm()).setNegativeButton("取消",(d,w)->result.cancel()).setOnCancelListener(d->result.cancel()).show();return true;
            }
        });
        web.loadUrl("http://127.0.0.1:"+PORT+"/updater/android-launcher.html");
    }
    private final class AndroidUpdateBridge {
        @JavascriptInterface public void check(){setLauncherStatus("正在检查更新…");runOnUiThread(()->checkForResourceUpdate());}
        @JavascriptInterface public void enter(){runOnUiThread(()->web.loadUrl("http://127.0.0.1:"+PORT+"/index.html"));}
        @JavascriptInterface public void logs(){new Thread(()->{try{JSONObject v=new JSONObject(new String(readAsset("game/updater/version.json"),StandardCharsets.UTF_8));StringBuilder b=new StringBuilder(v.optString("title"));JSONArray notes=v.optJSONArray("notes");if(notes!=null)for(int i=0;i<notes.length();i++)b.append("\n\n• ").append(notes.optString(i));runOnUiThread(()->new AlertDialog.Builder(MainActivity.this).setTitle("更新日志 "+v.optString("version")).setMessage(b.toString()).setPositiveButton("关闭",null).show());}catch(Exception ignored){}}).start();}
    }
    private void setLauncherStatus(String value){runOnUiThread(()->{if(web!=null)web.evaluateJavascript("(()=>{const e=document.getElementById('status');if(e)e.textContent="+JSONObject.quote(value)+"})()",null);});}
    private void checkForResourceUpdate() {
        new Thread(() -> {
            HttpURLConnection connection=null;
            try {
                JSONObject config=new JSONObject(new String(readAsset("game/updater/config.json"),StandardCharsets.UTF_8));
                String manifestUrl=config.getString("manifestUrl");
                if(!manifestUrl.startsWith("https://"))return;
                String host=new URL(manifestUrl).getHost().toLowerCase(Locale.ROOT);
                if(host.equals("github.com")||host.endsWith(".github.com")||host.equals("githubusercontent.com")||host.endsWith(".githubusercontent.com")||host.equals("github.io")||host.endsWith(".github.io"))return;
                connection=(HttpURLConnection)new URL(manifestUrl).openConnection();
                connection.setConnectTimeout(8000);connection.setReadTimeout(12000);connection.setUseCaches(false);
                if(connection.getResponseCode()!=200)return;
                JSONObject manifest=new JSONObject(new String(readStream(connection.getInputStream(),1024*1024),StandardCharsets.UTF_8));
                if(manifest.optInt("schema")!=1)return;
                JSONObject local=new JSONObject(new String(readAsset("game/updater/version.json"),StandardCharsets.UTF_8));
                String version=manifest.getString("version");
                if(!manifest.getString("baseVersion").equals(local.getString("baseVersion"))){setLauncherStatus("更新需要新的基础客户端");return;}
                String installed=new JSONObject(new String(server.read("updater/version.json"),StandardCharsets.UTF_8)).getString("version");
                if(!version.matches("\\d+(?:\\.\\d+)*")||!installed.matches("\\d+(?:\\.\\d+)*")){setLauncherStatus("版本格式无法比较，已阻止更新");return;}
                int order=compareVersions(version,installed);
                if(order<=0){setLauncherStatus(order<0?"本地 "+installed+" 高于云端 "+version+"，保留本地版本":"当前已是最新版本");return;}
                JSONObject pkg=manifest.optJSONObject("android");if(pkg==null){setLauncherStatus("当前更新源没有安卓资源包");return;}
                JSONObject info=new JSONObject().put("version",version).put("title",manifest.optString("title", "游戏资源更新"))
                    .put("notes",manifest.optJSONArray("notes")==null?new JSONArray():manifest.optJSONArray("notes"))
                    .put("url",pkg.getString("url")).put("bytes",pkg.getLong("bytes")).put("sha256",pkg.getString("sha256"));
                setLauncherStatus("发现新版本 "+version);
                runOnUiThread(() -> showResourceUpdate(info));
            } catch(Exception ignored) { setLauncherStatus("暂时无法检查更新，可稍后重试或直接进入游戏"); }
            finally { if(connection!=null)connection.disconnect(); }
        },"noname-update-check").start();
    }
    private static int compareVersions(String left,String right){String[] a=left.split("[.-]"),b=right.split("[.-]");for(int i=0;i<Math.max(a.length,b.length);i++){long x=i<a.length?numberPrefix(a[i]):0,y=i<b.length?numberPrefix(b[i]):0;if(x!=y)return Long.compare(x,y);}return left.compareTo(right);}
    private static long numberPrefix(String value){int end=0;while(end<value.length()&&Character.isDigit(value.charAt(end)))end++;try{return end==0?0:Long.parseLong(value.substring(0,end));}catch(NumberFormatException ignored){return 0;}}
    private byte[] readAsset(String path)throws IOException { try(InputStream in=getAssets().open(path)){return readStream(in,4*1024*1024);} }
    private static byte[] readStream(InputStream in,int limit)throws IOException {ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] b=new byte[32768];int n;while((n=in.read(b))!=-1){if(out.size()+n>limit)throw new IOException("Response too large");out.write(b,0,n);}return out.toByteArray();}
    private void showResourceUpdate(JSONObject info) {
        JSONArray notes=info.optJSONArray("notes");StringBuilder text=new StringBuilder(info.optString("title")).append("\n版本 ").append(info.optString("version"));
        if(notes!=null)for(int i=0;i<notes.length();i++)text.append("\n• ").append(notes.optString(i));
        new AlertDialog.Builder(this).setTitle("发现游戏更新").setMessage(text.toString())
            .setPositiveButton("下载并安装",(d,w)->downloadResourceUpdate(info)).setNegativeButton("稍后",(d,w)->setLauncherStatus("更新已跳过，可以进入游戏")).show();
    }
    private void downloadResourceUpdate(JSONObject info) {
        ProgressDialog progress=new ProgressDialog(this);progress.setTitle("下载游戏更新");progress.setMessage("正在下载并校验…");progress.setProgressStyle(ProgressDialog.STYLE_HORIZONTAL);progress.setMax(100);progress.setCancelable(false);progress.show();
        new Thread(() -> {String error=null;try {
            String url=info.getString("url");if(!url.startsWith("https://"))throw new IOException("更新包必须使用 HTTPS");
            HttpURLConnection c=(HttpURLConnection)new URL(url).openConnection();c.setConnectTimeout(15000);c.setReadTimeout(30000);c.setInstanceFollowRedirects(false);
            if(c.getResponseCode()!=200)throw new IOException("下载失败（HTTP "+c.getResponseCode()+")");
            long expected=info.getLong("bytes");if(expected<=0||expected>300L*1024*1024)throw new IOException("更新包大小不合法");
            File archive=new File(getCacheDir(),"resource-update.zip");MessageDigest digest=MessageDigest.getInstance("SHA-256");
            try(InputStream in=c.getInputStream();FileOutputStream out=new FileOutputStream(archive)){byte[] b=new byte[32768];long count=0;int n;while((n=in.read(b))!=-1){count+=n;if(count>expected)throw new IOException("下载内容超过清单大小");digest.update(b,0,n);out.write(b,0,n);int pct=(int)(count*100/expected);runOnUiThread(()->progress.setProgress(pct));}if(count!=expected)throw new IOException("下载内容长度不符");}
            StringBuilder actual=new StringBuilder();for(byte b:digest.digest())actual.append(String.format(Locale.ROOT,"%02x",b));if(!actual.toString().equalsIgnoreCase(info.getString("sha256")))throw new IOException("更新包 SHA-256 校验失败");
            installResourceArchive(archive,info.getString("version"));
            getSharedPreferences("updater",MODE_PRIVATE).edit().putString("resourceVersion",info.getString("version")).apply();
            archive.delete();
        } catch(Exception e){error=e.getMessage()==null?e.toString():e.getMessage();}
        final String result=error;runOnUiThread(()->{progress.dismiss();setLauncherStatus(result==null?"更新完成，请进入游戏加载新资源":"更新失败，可重试或直接进入游戏");AlertDialog.Builder dialog=new AlertDialog.Builder(this).setTitle(result==null?"更新已安装":"更新失败").setMessage(result==null?"游戏资源已更新，点击进入游戏即可加载新资源。":"资源未更新："+result);if(result==null)dialog.setPositiveButton("进入游戏",(d,w)->web.loadUrl("http://127.0.0.1:"+PORT+"/index.html"));else dialog.setPositiveButton("确定",null);dialog.show();});
        },"noname-update-download").start();
    }
    private void installResourceArchive(File archive,String version)throws Exception {
        String installed=new JSONObject(new String(server.read("updater/version.json"),StandardCharsets.UTF_8)).getString("version");
        if(compareVersions(version,installed)<=0)throw new IOException("禁止安装相同或更旧的资源版本");
        Map<String,String> expected=new LinkedHashMap<>();
        try(ZipFile zip=new ZipFile(archive)){ZipEntry payload=zip.getEntry("payload.json");if(payload==null)throw new IOException("更新包缺少文件清单");
            JSONObject data=new JSONObject(new String(readStream(zip.getInputStream(payload),4*1024*1024),StandardCharsets.UTF_8));if(!version.equals(data.getString("version")))throw new IOException("更新版本不匹配");
            JSONArray files=data.getJSONArray("files");if(files.length()==0||files.length()>30000)throw new IOException("更新文件列表不合法");
            for(int i=0;i<files.length();i++){JSONObject item=files.getJSONObject(i);String path=item.getString("path"),hash=item.getString("sha256");if(path.startsWith("/")||path.contains("\\")||Arrays.asList(path.split("/")).contains("..")||!hash.matches("(?i)[0-9a-f]{64}")||expected.put(path,hash)!=null)throw new IOException("更新路径或哈希不合法");}
            File root=new File(getFilesDir(),"game-files");
            for(Map.Entry<String,String> item:expected.entrySet()){ZipEntry entry=zip.getEntry(item.getKey());if(entry==null||entry.isDirectory())throw new IOException("更新文件缺失："+item.getKey());byte[] bytes=readStream(zip.getInputStream(entry),64*1024*1024);MessageDigest md=MessageDigest.getInstance("SHA-256");StringBuilder hash=new StringBuilder();for(byte b:md.digest(bytes))hash.append(String.format(Locale.ROOT,"%02x",b));if(!hash.toString().equalsIgnoreCase(item.getValue()))throw new IOException("文件校验失败："+item.getKey());File target=new File(root,item.getKey());if(!target.getCanonicalPath().startsWith(root.getCanonicalPath()+File.separator))throw new IOException("更新路径越界");target.getParentFile().mkdirs();try(FileOutputStream out=new FileOutputStream(target)){out.write(bytes);}}
            server.refreshResourceVersion();
        }
    }
    private void publishSafeArea() {
        if (web == null) return;
        web.post(() -> web.evaluateJavascript("window.__nonameInsets={left:"+safeLeft+",top:"+safeTop+
            ",right:"+safeRight+",bottom:"+safeBottom+",width:"+Math.max(1,web.getWidth())+
            "};window.dispatchEvent(new Event('noname-safe-area'));", null));
    }
    /** Draw behind the cutout; pass safe bounds to web controls without a blank frame strip. */
    private void configureGameWindow() {
        if (Build.VERSION.SDK_INT >= 28) {
            WindowManager.LayoutParams attributes = getWindow().getAttributes();
            attributes.layoutInDisplayCutoutMode = Build.VERSION.SDK_INT >= 30
                ? WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_ALWAYS
                : WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            getWindow().setAttributes(attributes);
        }
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
                | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
                | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
        }
        gameFrame.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int left=0, top=0, right=0, bottom=0, keyboard=0;
            if (Build.VERSION.SDK_INT >= 30) {
                Insets safe = windowInsets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout());
                left=safe.left; top=safe.top; right=safe.right; bottom=safe.bottom;
                keyboard=windowInsets.getInsets(WindowInsets.Type.ime()).bottom;
            } else {
                left=windowInsets.getSystemWindowInsetLeft(); top=windowInsets.getSystemWindowInsetTop();
                right=windowInsets.getSystemWindowInsetRight(); bottom=windowInsets.getSystemWindowInsetBottom();
                if (bottom > view.getHeight()/4) { keyboard=bottom; bottom=0; }
                if (Build.VERSION.SDK_INT >= 28 && windowInsets.getDisplayCutout()!=null) {
                    DisplayCutout cutout=windowInsets.getDisplayCutout();
                    left=Math.max(left,cutout.getSafeInsetLeft()); top=Math.max(top,cutout.getSafeInsetTop());
                    right=Math.max(right,cutout.getSafeInsetRight()); bottom=Math.max(bottom,cutout.getSafeInsetBottom());
                }
            }
            safeLeft=left; safeTop=top; safeRight=right; safeBottom=bottom;
            view.setPadding(0,0,0,keyboard);
            publishSafeArea();
            return windowInsets;
        });
        gameFrame.requestApplyInsets();
    }
    @Override public void onWindowFocusChanged(boolean focused) {
        super.onWindowFocusChanged(focused);
        if (focused && web!=null) configureGameWindow();
    }
    @Override public void onBackPressed() {
        new AlertDialog.Builder(this).setMessage("返回桌面？联机时请保持游戏在前台。").setPositiveButton("返回桌面",(d,w)->moveTaskToBack(true)).setNegativeButton("继续游戏",null).show();
    }
    @Override protected void onDestroy() {
        if(web!=null)web.destroy();
        if(server!=null)server.close();
        super.onDestroy();
    }
    private static final class LocalServer {
        private final AssetManager assets;
        private final File storage;
        private volatile boolean preferBundled;
        private final ServerSocket socket;
        private final ExecutorService pool=Executors.newFixedThreadPool(8);
        LocalServer(AssetManager assets,File storage)throws IOException {
            this.assets=assets;this.storage=new File(storage,"game-files");
            refreshResourceVersion();
            socket=new ServerSocket();socket.setReuseAddress(true);socket.bind(new InetSocketAddress("127.0.0.1",PORT));
        }
        void start(){new Thread(()->{while(!socket.isClosed()){try{Socket client=socket.accept();pool.execute(()->handle(client));}catch(IOException ignored){break;}}},"noname-local-http").start();}
        void close(){try{socket.close();}catch(IOException ignored){}pool.shutdownNow();}
        void refreshResourceVersion() {
            // An older private patch must never shadow a freshly installed APK.
            preferBundled=true;
            try(InputStream bundled=assets.open("game/updater/version.json");InputStream overlay=new FileInputStream(new File(storage,"updater/version.json"))){
                String base=new JSONObject(new String(bytes(bundled),StandardCharsets.UTF_8)).getString("version");
                String patch=new JSONObject(new String(bytes(overlay),StandardCharsets.UTF_8)).getString("version");
                preferBundled=!patch.matches("\\d+(?:\\.\\d+)*")||!base.matches("\\d+(?:\\.\\d+)*")||compareVersions(patch,base)<=0;
            }catch(Exception ignored){}
        }
        String clean(String value)throws IOException {
            if(value==null)value="";
            value=value.replace('\\','/');
            if(value.startsWith("/")||value.contains(":")||Arrays.asList(value.split("/")).contains("..")||value.indexOf('\0')>=0)throw new IOException("Invalid path");
            return value;
        }
        byte[] read(String path)throws IOException {
            File local=new File(storage,path);
            if(preferBundled){try(InputStream input=assets.open("game/"+path)){return bytes(input);}catch(FileNotFoundException ignored){}}
            try(InputStream input=local.isFile()?new FileInputStream(local):assets.open("game/"+path)) {return bytes(input);}
        }
        static byte[] bytes(InputStream input)throws IOException {ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[32768];int n;while((n=input.read(buf))!=-1)out.write(buf,0,n);return out.toByteArray();}
        String type(String path)throws IOException {
            File local=new File(storage,path);if(local.isFile())return "file";if(local.isDirectory())return "directory";
            try(InputStream input=assets.open("game/"+path)){return "file";}catch(IOException absent){return assets.list("game/"+path).length>0?"directory":null;}
        }
        void handle(Socket client) {
            try(Socket connection=client) {
                connection.setSoTimeout(10000);
                InputStream input=connection.getInputStream();
                String request=line(input);if(request==null)return;
                String[] parts=request.split(" ");if(parts.length<2)return;
                String host="",origin="";int length=0;String header;
                while((header=line(input))!=null&&!header.isEmpty()) {
                    int split=header.indexOf(':');if(split<0)continue;
                    String name=header.substring(0,split).toLowerCase(Locale.ROOT),value=header.substring(split+1).trim();
                    if(name.equals("host"))host=value;
                    if(name.equals("origin"))origin=value;
                    if(name.equals("content-length"))length=Integer.parseInt(value);
                }
                String expected="127.0.0.1:"+PORT;
                if(!host.equals(expected)||(!origin.isEmpty()&&!origin.equals("http://"+expected))||length<0||length>16000000){respond(connection,403,"text/plain",new byte[0]);return;}
                Uri uri=Uri.parse("http://"+expected+parts[1]);String route=uri.getPath();
                if(route==null)throw new IOException("Missing route");
                if(Arrays.asList("/checkFile","/readFile","/getFileList","/writeFile","/createDir","/removeFile","/removeDir").contains(route)) {
                    JSONObject result=new JSONObject();Object data=JSONObject.NULL;
                    try {
                        String path=clean(uri.getQueryParameter(route.equals("/getFileList")||route.equals("/createDir")?"dir":"fileName"));
                        if(route.equals("/checkFile")){String kind=type(path);data=kind==null?JSONObject.NULL:kind;}
                        if(route.equals("/readFile"))data=android.util.Base64.encodeToString(read(path),android.util.Base64.NO_WRAP);
                        if(route.equals("/getFileList")){
                            Set<String> names=new TreeSet<>(Arrays.asList(assets.list("game/"+path)));String[] local=new File(storage,path).list();if(local!=null)names.addAll(Arrays.asList(local));
                            JSONArray folders=new JSONArray(),files=new JSONArray();for(String name:names){String kind=type(path.isEmpty()?name:path+"/"+name);if("directory".equals(kind))folders.put(name);else files.put(name);}data=new JSONObject().put("folders",folders).put("files",files);
                        }
                        if(route.equals("/writeFile")){
                            if(!parts[0].equals("POST"))throw new IOException("POST required");
                            byte[] body=new byte[length];int offset=0;while(offset<length){int n=input.read(body,offset,length-offset);if(n<0)throw new EOFException();offset+=n;}
                            JSONObject bodyJson=new JSONObject(new String(body,StandardCharsets.UTF_8));path=clean(bodyJson.getString("path"));JSONArray values=bodyJson.getJSONArray("data");byte[] contents=new byte[values.length()];for(int i=0;i<contents.length;i++)contents[i]=(byte)values.getInt(i);
                            File target=new File(storage,path);target.getParentFile().mkdirs();try(OutputStream out=new FileOutputStream(target)){out.write(contents);}
                        }
                        if(route.equals("/createDir"))new File(storage,path).mkdirs();
                        if(route.equals("/removeFile")){
                            File target=new File(storage,path);
                            if(!target.isFile()||!target.delete())throw new IOException("File not found or could not be removed");
                        }
                        if(route.equals("/removeDir")){
                            File target=new File(storage,path);
                            if(!target.isDirectory()||!target.delete())throw new IOException("Directory not empty or could not be removed");
                        }
                        result.put("success",true).put("data",data);
                    }catch(Exception error){result.put("success",false).put("errorMsg",String.valueOf(error.getMessage()));}
                    respond(connection,200,"application/json",result.toString().getBytes(StandardCharsets.UTF_8));return;
                }
                if(!parts[0].equals("GET")&&!parts[0].equals("HEAD")){respond(connection,405,"text/plain",new byte[0]);return;}
                String path=clean(route.equals("/")?"index.html":route.substring(1));
                try{respond(connection,200,mime(path),read(path));}catch(IOException absent){respond(connection,404,"text/plain",new byte[0]);}
            }catch(Exception ignored){}
        }
        static String line(InputStream input)throws IOException {ByteArrayOutputStream buf=new ByteArrayOutputStream();int b;while((b=input.read())!=-1){if(b=='\n')break;if(b!='\r')buf.write(b);if(buf.size()>16384)throw new IOException("Header too long");}return b==-1&&buf.size()==0?null:buf.toString("UTF-8");}
        static String mime(String path){String ext=path.substring(path.lastIndexOf('.')+1).toLowerCase(Locale.ROOT);switch(ext){case "js":case "mjs":return "text/javascript";case "json":return "application/json";case "html":return "text/html";case "css":return "text/css";case "jpg":case "jpeg":return "image/jpeg";case "png":return "image/png";case "webp":return "image/webp";case "svg":return "image/svg+xml";case "mp3":return "audio/mpeg";case "woff2":return "font/woff2";default:return "application/octet-stream";}}
        static void respond(Socket client,int status,String mime,byte[] body)throws IOException {OutputStream out=client.getOutputStream();String header="HTTP/1.1 "+status+" "+(status==200?"OK":"Error")+"\r\nContent-Type: "+mime+"\r\nContent-Length: "+body.length+"\r\nCache-Control: no-store\r\nConnection: close\r\n\r\n";out.write(header.getBytes(StandardCharsets.US_ASCII));out.write(body);out.flush();}
    }
}
