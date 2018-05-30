var request = require('request');

module.exports = function(app) {
    //
    // GET /bot
    // 
    app.get('/bot', function(request, response) {
        if (request.query['hub.mode'] === 'subscribe' && 
            request.query['hub.verify_token'] === "token") {            
            console.log("验证webhook");
            response.status(200).send(request.query['hub.challenge']);
        } else {
            console.error("验证失败。确保验证令牌匹配");
            response.sendStatus(403);          
        }  
    });

    app.post('/bot', function(request, response) {
        var data = request.body;
        console.log('收到机器人webhook', data);
         // 确保这是一个页面订阅
         if (data.object === 'page') {
             // 遍历每个条目——如果批处理，可能会有多个
             data.entry.forEach(function(entry) {
                var pageID = entry.id;
                var timeOfEvent = entry.time;
                 // 迭代每个消息传递事件
                 entry.messaging.forEach(function(event) {
                     if (event.message) {
                         receivedMessage(event);
                     } else if (event.game_play) {
                         receivedGameplay(event);
                     } else {
                         console.log("Webhook收到未知事件: ", event);
                     }
                 });
             });
         }
         response.sendStatus(200);
     });

    //处理玩家直接发送给游戏机器人的消息
    function receivedMessage(event) {
        console.log("处理玩家直接发送给游戏机器人的消息", event)
    }

    //在这里处理game_play(当玩家关闭游戏)事件
    function receivedGameplay(event) {
        console.log("game_play", event)
        // bot用户的页面范围ID
        var senderId = event.sender.id; 

        // FBInstant player ID
        var playerId = event.game_play.player_id; 

        // FBInstant context ID 
        var contextId = event.game_play.context_id;

        // 检查负载
        if (event.game_play.payload) {
            //
            // 变量有效载荷包含了数据集
            // FBInstant.setSessionData()
            //
            var payload = JSON.parse(event.game_play.payload);

            //bot只是“响应”收到的消息
            
            sendMessage(senderId, null, "Message to game client: '" + payload.message + "'", "Play now!", payload);
        }
    }

    function sendMessage(player, context, message, cta, payload) {
        var button = {
            type: "game_play",
            title: cta
        };

        if (context) {
            button.context = context;
        }
        if (payload) {
            button.payload = JSON.stringify(payload)
        }
        var messageData = {
            recipient: {
                id: player
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [
                        {
                            title: message,
                            buttons: [button]
                        }
                        ]
                    }
                }
            }
        };
        callSendAPI(messageData);
    }

    function callSendAPI(messageData) {
        var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token='+"EAAF6NRlABZBABAFHZB2frBIvDvamqtD8Fu3Fpv8Y3SZBVNvHCuDBHQJIYjFGQjSGS6x9r76ZBl5WeV8hyVPHAScg86oi2mnjokniAZCJlZBk5giZBNVOmXHp8hXkFzqw7nO3RCh9EnHALY8RloHSZAKX7rYZAtNxeZAb3Cfk1fgy9V1dslNu1xZBAk5"
        request({
            url: graphApiUrl,
            method: "POST",
            json: true,  
            body: messageData
        }, function (error, response, body){
            console.error('send api returned', 'error', error, 'status code', response.statusCode, 'body', body);
        });
    }
}