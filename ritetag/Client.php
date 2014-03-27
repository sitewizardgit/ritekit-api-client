<?php

namespace ritetag;

/**
 * Description of Response
 *
 * @author Houžva Pavel <pavel@ritetag.com>
 * @version 1.0
 */
class Client {

    private $host = "http://dev.ritetag.com/api/v2/";
    private $timeout = 30;
    private $connecttimeout = 30;
    private $sslVerifypeer = FALSE;
    private $decodeJson = false;
    private $useragent = 'RitetagClient v1.0.0';

    function accessTokenURL() {
        return 'http://dev.ritetag.com/oauth/access_token';
    }

    function authorizeURL() {
        return 'http://dev.ritetag.com/oauth/authorize';
    }

    function requestTokenURL() {
        return 'http://dev.ritetag.com/oauth/request_token';
    }

    /**
     * 
     * @param string $consumer_key
     * @param string $consumer_secret
     * @param string $oauth_token
     * @param string $oauth_token_secret
     */
    function __construct($consumer_key, $consumer_secret, $oauth_token = NULL, $oauth_token_secret = NULL) {
        $this->sha1_method = new \OAuthSignatureMethod_HMAC_SHA1();
        $this->consumer = new \OAuthConsumer($consumer_key, $consumer_secret);
        if (!empty($oauth_token) && !empty($oauth_token_secret)) {
            $this->token = new \OAuthConsumer($oauth_token, $oauth_token_secret);
        } else {
            $this->token = NULL;
        }
    }

    /**
     * Get a request_token from Twitter
     *
     * @returns a key/value array containing oauth_token and oauth_token_secret
     */
    function getRequestToken($oauthCallback) {
        $parameters = array();
        $parameters['oauth_callback'] = $oauthCallback;
        $request = $this->oAuthRequest($this->requestTokenURL(), 'GET', $parameters);
        $token = \Oauth\OAuthUtil::parse_parameters($request);
        $this->token = new \Oauth\OAuthConsumer($token['oauth_token'], $token['oauth_token_secret']);
        return $token;
    }

    /**
     * Get the authorize URL
     *
     * @returns a string
     */
    function getAuthorizeURL($token) {
        if (is_array($token)) {
            $token = $token['oauth_token'];
        }
        return $this->authorizeURL() . "?oauth_token={$token}";
    }

    /**
     * Exchange request token and secret for an access token and
     * secret, to sign API calls.
     */
    function getAccessToken($oauth_verifier) {
        $parameters = array();
        $parameters['oauth_verifier'] = $oauth_verifier;
        $request = $this->oAuthRequest($this->accessTokenURL(), 'GET', $parameters);
        $token = \OAuthUtil::parse_parameters($request);
        $this->token = new OAuthConsumer($token['oauth_token'], $token['oauth_token_secret']);
        return $token;
    }

    /**
     * get info about query
     * @param string $query
     * @return \ritetag\Response
     */
    public function aiTwitter($query) {
        return $this->get("ai/twitter2/" . urlencode($query));
    }

    /**
     * GET request
     * @param string $url
     * @param array $parameters
     * @return \ritetag\Response
     */
    private function get($url, $parameters = array()) {
        return $this->oAuthRequest($url, 'GET', $parameters);
    }

    /**
     * POST request
     * @param string $url
     * @param array $parameters
     * @return \ritetag\Response
     */
    function post($url, $parameters = array()) {
        return $this->oAuthRequest($url, 'POST', $parameters);
    }

    /**
     * 
     * @param strimg $url
     * @param array $parameters
     * @return \ritetag\Response
     */
    private function put($url, $parameters = array()) {
        return $this->oAuthRequest($url, 'PUT', $parameters);
    }

    /**
     * DELETE request
     * @param string $url
     * @param array $parameters
     * @return \ritetag\Response
     */
    private function delete($url, $parameters = array()) {
        return $this->oAuthRequest($url, 'DELETE', $parameters);
    }


    /**
     * sign request
     * 
     * @param string $url
     * @param string $method
     * @param array $parameters
     * @return string response body
     */
    private function oAuthRequest($url, $method, $parameters) {
        if (strrpos($url, 'https://') !== 0 && strrpos($url, 'http://') !== 0) {
            $url = "{$this->host}{$url}";
        }
        $request = \OAuthRequest::from_consumer_and_token($this->consumer, $this->token, $method, $url, $parameters);
        $request->sign_request($this->sha1_method, $this->consumer, $this->token);
        switch ($method) {
            case 'GET':
                return $this->http($request->to_url(), 'GET');
            default:
                return $this->http($request->get_normalized_http_url(), $method, $request->to_postdata());
        }
    }

    /**
     * 
     * @param string $url
     * @param string $method
     * @param array $postfields
     * @return string
     */
    private function http($url, $method, $postfields = NULL) {
        $ci = curl_init();
        /* Curl settings */
        curl_setopt($ci, CURLOPT_USERAGENT, $this->useragent);
        curl_setopt($ci, CURLOPT_CONNECTTIMEOUT, $this->connecttimeout);
        curl_setopt($ci, CURLOPT_TIMEOUT, $this->timeout);
        curl_setopt($ci, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ci, CURLOPT_HTTPHEADER, array('Expect:'));
        curl_setopt($ci, CURLOPT_SSL_VERIFYPEER, $this->sslVerifypeer);
        curl_setopt($ci, CURLOPT_HEADER, true);

        switch ($method) {
            case 'POST':
                curl_setopt($ci, CURLOPT_POST, TRUE);
                if (!empty($postfields)) {
                    curl_setopt($ci, CURLOPT_POSTFIELDS, $postfields);
                }
                break;
            case 'PUT':
                curl_setopt($ci, CURLOPT_CUSTOMREQUEST, 'PUT');
                if (!empty($postfields)) {
                    $url = "{$url}?{$postfields}";
                }
                break;
            case 'DELETE':
                curl_setopt($ci, CURLOPT_CUSTOMREQUEST, 'DELETE');
                if (!empty($postfields)) {
                    $url = "{$url}?{$postfields}";
                }
        }

        curl_setopt($ci, CURLOPT_URL, $url);
        $ret = curl_exec($ci);
        $statusCode = curl_getinfo($ci, CURLINFO_HTTP_CODE);
        $httpInfo = curl_getinfo($ci);
        list($headers, $content) = explode("\r\n\r\n", $ret, 2);
        $headers = $this->getHeaders($headers);
        $remain = isset($headers["X-Limit-Remain"])?$headers["X-Limit-Remain"]:null;
        $response = new Response($httpInfo, $headers, $content, $statusCode, $remain);
        curl_close($ci);
        return $response;
    }

    /**
     * parse response header to array
     * @param string $header
     * @return array
     */
    private function getHeaders($header) {
        $headers = [];
        foreach (explode("\r\n", $header) as $i => $line)
            if ($i === 0)
                $headers['http_code'] = $line;
            else {
                list ($key, $value) = explode(': ', $line);
                $headers[$key] = $value;
            }
        return $headers;
    }

}
