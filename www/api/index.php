<?php
require_once '../../config.php';
require_once '../../vendor/autoload.php';

$router = new SimpleRouter();
$client = new \Ritetag\API\Client(CONSUMER_KEY, CONSUMER_SECRET, OAUTH_TOKEN, OAUTH_TOKEN_SECRET);

$router->get("/^\/ai\/twitter\/([a-z]+)\/?$/i", function($matches) use($client){
    echo $client->aiTwitter($matches[1])->getBody();
});
//trending-hashtags
$router->get("/^\/trending-hashtags\/?$/i", function($matches) use($client){
    $green = isset($_GET['green']) && $_GET['green']=='true';
    $onlylatin = isset($_GET['onlylatin']) && $_GET['onlylatin']=='true';
    echo $client->trendingHashtags($green, $onlylatin)->getBody();
});
$router->get("/^\/hashtagsforurl(\/)?$/i", function($matches) use($client){
    $url=$_GET['url'];
    echo $client->hashtagsForLinks($url)->getBody();
});
//
$router->notFound(function(){
    echo "Not found";
});
$router->run();





class SimpleRouter {
    private $request;
    private $method;
    private $callbacks;
    
    public function __construct() {
        $this->request = str_replace(__DIR__, "", $_SERVER['DOCUMENT_ROOT'].$_SERVER['REQUEST_URI']);
        
        if(strpos($this->request, "?")){
            $req = explode("?", $this->request);
            $this->request = $req[0];
        }
        $this->method = $_SERVER['REQUEST_METHOD'];
        $this->callbacks = ["GET"=>[],"POST"=>[],"PUT"=>[],"DELETE"=>[],"NOTFOUND"=>null];
    }
    public function get($regex,$callback){
        $this->map("GET", $regex, $callback);
    }
    public function post($regex,$callback){
        $this->map("POST", $regex, $callback);
    }
    public function put($regex,$callback){
        $this->map("PUT", $regex, $callback);
    }
    public function delete($regex,$callback){
        $this->map("DELETE", $regex, $callback);
    }
    public function notFound($callback){
        $this->callbacks['NOTFOUND']=$callback;
    }
    private function map($method,$regex,$callback){
        $this->callbacks[$method][]=['regex'=>$regex,'callback'=>$callback];
    }
    
    public function run(){
        foreach($this->callbacks[$this->method] as $callback){
            preg_match($callback['regex'], $this->request, $matches);
            if($matches){
                $callback['callback']($matches);
                return;
            }
        }
        if($this->callbacks['NOTFOUND']!=null){
            $this->callbacks['NOTFOUND']();
        }
    }
}


