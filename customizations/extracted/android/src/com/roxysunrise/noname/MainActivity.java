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
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;
import org.json.*;

/** Offline game assets with the same HTTP filesystem contract as the desktop browser build. */
public final class MainActivity extends Activity {
    private WebView web;
    private FrameLayout gameFrame;
    private LocalServer server;
    private static final int PORT = 18765;
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
        web.setWebViewClient(new WebViewClient() {
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
        web.loadUrl("http://127.0.0.1:"+PORT+"/index.html");
    }
    /** Keep web hit areas inside visible system/cutout bounds, including Android 15 edge-to-edge. */
    private void configureGameWindow() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) {
                controller.hide(WindowInsets.Type.systemBars());
                controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
                | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION);
        }
        gameFrame.setOnApplyWindowInsetsListener((view, windowInsets) -> {
            int left=0, top=0, right=0, bottom=0;
            if (Build.VERSION.SDK_INT >= 30) {
                Insets safe = windowInsets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                left=safe.left; top=safe.top; right=safe.right; bottom=safe.bottom;
            } else {
                left=windowInsets.getSystemWindowInsetLeft(); top=windowInsets.getSystemWindowInsetTop();
                right=windowInsets.getSystemWindowInsetRight(); bottom=windowInsets.getSystemWindowInsetBottom();
                if (Build.VERSION.SDK_INT >= 28 && windowInsets.getDisplayCutout()!=null) {
                    DisplayCutout cutout=windowInsets.getDisplayCutout();
                    left=Math.max(left,cutout.getSafeInsetLeft()); top=Math.max(top,cutout.getSafeInsetTop());
                    right=Math.max(right,cutout.getSafeInsetRight()); bottom=Math.max(bottom,cutout.getSafeInsetBottom());
                }
            }
            view.setPadding(left,top,right,bottom);
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
        private final ServerSocket socket;
        private final ExecutorService pool=Executors.newFixedThreadPool(8);
        LocalServer(AssetManager assets,File storage)throws IOException {
            this.assets=assets;this.storage=new File(storage,"game-files");
            socket=new ServerSocket();socket.setReuseAddress(true);socket.bind(new InetSocketAddress("127.0.0.1",PORT));
        }
        void start(){new Thread(()->{while(!socket.isClosed()){try{Socket client=socket.accept();pool.execute(()->handle(client));}catch(IOException ignored){break;}}},"noname-local-http").start();}
        void close(){try{socket.close();}catch(IOException ignored){}pool.shutdownNow();}
        String clean(String value)throws IOException {
            if(value==null)value="";
            value=value.replace('\\','/');
            if(value.startsWith("/")||value.contains(":")||Arrays.asList(value.split("/")).contains("..")||value.indexOf('\0')>=0)throw new IOException("Invalid path");
            return value;
        }
        byte[] read(String path)throws IOException {
            File local=new File(storage,path);
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
                if(Arrays.asList("/checkFile","/readFile","/getFileList","/writeFile","/createDir").contains(route)) {
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
