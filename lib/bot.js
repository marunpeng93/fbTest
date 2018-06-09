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
        console.log(JSON.stringify(data))
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
            title: "button title"
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
                                "title":"Welcome!",
                                "image_url":"https://scontent-nrt1-1.xx.fbcdn.net/v/t1.0-9/34881900_704811476577054_8583601190275645440_o.jpg?_nc_cat=0&_nc_eui2=AeFDTJ2t0BM2LxyeYXW-5bWqVXuPNiPxiyVViMoIeewBMAcAEDvVGgf9KzWZcyl29SYwcxsJTB_oBjto6ADD63H8ANeemlMiAWFLfTbk0zjgsg&oh=5a701b4b8c832d388934af27dff9be87&oe=5BB0F038",
                                "subtitle":"We have the right hat for everyone.",
                                "buttons":[{
                                    type: "game_play",
                                    title: "button title"
                                }]
                            }
                        ]
                    }
                }
            }
        };
        callSendAPI(messageData);
    }

    function callSendAPI(messageData) {
        var graphApiUrl = 'https://graph.facebook.com/me/messages?access_token='+"EAACrdzvAj5oBAG0ABH1qRZCfHAKxSaPezTjFauG2keZAjYakvrdHTOwT3st16cZAZCPtWhuS0lb3r5Vhrj7wNP6b0XmIx2MhzX2g9rePCDOJBQOAxZA1he8FWa9ErnsDz816ewfLMkMTMOrNWUzZBxZAyYCZAOaf6vKuq79CGuxLKGrc26mSPJbL"
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