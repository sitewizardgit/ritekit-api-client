# README #

##[Browse the code](https://bitbucket.org/ritetag/ritetag-api/src/)##



##How to implement RiteTag hashtag bar to a textarea##

This is how RiteTag Hashtag Bar looks like in Twitter. Using our sample code, you can make it work for any textarea on your site too (currently, without colorized hashtags inside the textarea).

![hashtagbar.png](https://bitbucket.org/repo/pMKgRz/images/993122408-hashtagbar.png)

##1. Create RiteTag developer account##

##2a. Save folder *** to assets on your web##

##2b. Install via composer ##
composer create-project ritetag/api ritetag-app

##3. Link JS and CSS files in <head> ##


```
#!html
<script src="/assets/js/jquery-1.11.1.min.js"></script>¨
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.0/css/bootstrap.min.css">

```

##4. Copy this where you want the infobar to appear##
```
#!html
<div ></div>

```

##5. Implement PHP library for handling API call proxy##