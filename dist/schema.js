"use strict";
// twitter card markup https://developer.twitter.com/en/docs/tweets/optimize-with-cards/overview/markup.html
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = new Map([
    ['twitter:card', { entry: 'twitter_cards', name: 'card', type: 'string' }],
    ['twitter:url', { entry: 'twitter_cards', name: 'url', type: 'url' }],
    ['twitter:site', { entry: 'twitter_cards', name: 'site', type: 'string' }],
    ['twitter:creator', { entry: 'twitter_cards', name: 'creator', type: 'string' }],
    ['twitter:creator:id', { entry: 'twitter_cards', name: 'creator_id', type: 'string' }],
    ['twitter:title', { entry: 'twitter_cards', name: 'title', type: 'string' }],
    ['twitter:description', { entry: 'twitter_cards', name: 'description', type: 'string' }],
    ['twitter:image', { entry: 'twitter_cards', name: 'url', parent: 'images', type: 'url' }],
    ['twitter:image:src', { entry: 'twitter_cards', name: 'url', parent: 'images', type: 'url' }],
    ['twitter:image:alt', { entry: 'twitter_cards', name: 'alt', parent: 'images', type: 'string' }],
    ['twitter:player', { entry: 'twitter_cards', name: 'player', parent: 'players', type: 'string' }],
    ['twitter:player:stream', { entry: 'twitter_cards', name: 'stream', parent: 'players', type: 'string' }],
    ['twitter:player:width', { entry: 'twitter_cards', name: 'width', parent: 'players', type: 'number' }],
    ['twitter:player:height', { entry: 'twitter_cards', name: 'height', parent: 'players', type: 'number' }],
    ['twitter:app:id:iphone', { entry: 'twitter_cards', name: 'id', parent: 'apps', category: 'iphone', type: 'number' }],
    ['twitter:app:name:iphone', { entry: 'twitter_cards', name: 'name', parent: 'apps', category: 'iphone', type: 'string' }],
    ['twitter:app:url:iphone', { entry: 'twitter_cards', name: 'url', parent: 'apps', category: 'iphone', type: 'string' }],
    ['twitter:app:id:ipad', { entry: 'twitter_cards', name: 'id', parent: 'apps', category: 'ipad', type: 'number' }],
    ['twitter:app:name:ipad', { entry: 'twitter_cards', name: 'name', parent: 'apps', category: 'ipad', type: 'string' }],
    ['twitter:app:url:ipad', { entry: 'twitter_cards', name: 'url', parent: 'apps', category: 'ipad', type: 'string' }],
    ['twitter:app:id:googleplay', { entry: 'twitter_cards', name: 'id', parent: 'apps', category: 'googleplay', type: 'number' }],
    ['twitter:app:name:googleplay', { entry: 'twitter_cards', name: 'name', parent: 'apps', category: 'googleplay', type: 'string' }],
    ['twitter:app:url:googleplay', { entry: 'twitter_cards', name: 'url', parent: 'apps', category: 'googleplay', type: 'string' }]
]);
exports.keys = Array.from(exports.schema.keys());
