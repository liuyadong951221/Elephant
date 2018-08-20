        var socket;
        var send=function(type,data,to_client_id){
            var msg = {type:type,data:data};
            if(to_client_id){
                msg.to_client_id=to_client_id;
            }
            socket.send(JSON.stringify(msg));
            if(type=='race'){
                vm.look=true;
                vm.opPrev='';
            }
            console.log('SEND',msg)
        }
        var vm = new Vue({
            el:'.wrap',
            data(){
                return {
                    showExp:false,
                    look:false, //锁
                    status:'',  //状态
                    client_id:'',  //我方id
                    to_client_id:'', //对方Id
                    myName:'',   //我的名字
                    userList:[], //用户列表
                    meActive:'', //我方当前选中
                    opActive:'', //对方当前选中
                    opPrev:'', //对方上一步位置
                    opProgress:0,
                    meProgress:0,
                    chess:[
                        [
                            7,6,6,5,5,4,4,3,3,2,2,1,1,1,1,1    //对方的
                        ],
                        [
                            7,6,6,5,5,4,4,3,3,2,2,1,1,1,1,1    //自己的
                        ],
                    ],
                    cell:[
                            [
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],[
                               {
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               },{
                                status:0
                               }
                            ],
                    ]
                }
            },
            methods:{
                startGame(){
                    this.chess=[
                        [
                            7,6,6,5,5,4,4,3,3,2,2,1,1,1,1,1    //对方的
                        ],
                        [
                            7,6,6,5,5,4,4,3,3,2,2,1,1,1,1,1    //自己的
                        ],
                    ];
                    this.meActive='';
                    this.opActive='';
                    this.opPrev='';
                    this.cell.map(row=>{
                        row.map(col=>{
                            delete col.id;
                            delete col.role;
                            col.status=0;
                        })
                    })
                    this.cell=JSON.parse(JSON.stringify(this.cell))
                    this.status='ongoing';
                },
                random(max,min){
                    return Math.floor(Math.random()*(max-min+1)+min);
                },
                cellClick(rowInd,colInd,row,col){
                    if(this.look){
                        return;
                    }
                    if(col.status==0){
                        this.createdCell(col,colInd,rowInd);
                        this.meActive='';
                        return;
                    }
                    if(this.meActive){   //已经选过一次
                        if(col.status==1){  //点击空白 移动位置
                            var activeInd=this.meActive.split(',');  ////上一个的坐标
                            var fromX = parseInt(activeInd[1]);
                            var fromY = parseInt(activeInd[0]);
                            var toX = colInd;
                            var toY = rowInd;
                            if( (Math.abs(fromX-toX) == 1 && fromY == toY ) || ( Math.abs(fromY-toY) ==1 && fromX==toX)){
                                this.move(fromX,fromY,toX,toY,false);
                            }else{
                                alert('只能移动一个格子哦')
                            }
                            return;
                        }
                        if(col.role=='me'){ // 重新选择
                            this.meActive=rowInd+','+colInd;
                            return;
                        }
                        if(col.role=="op"){ //攻击对方
                            var activeInd=this.meActive.split(',');  //上一个的坐标
                            var fromX = parseInt(activeInd[1]);
                            var fromY = parseInt(activeInd[0]);
                            var toX = colInd;
                            var toY = rowInd;
                            var from = this.cell[fromY][fromX];
                            if(from.id==2){   //足球
                                if(fromX==toX){
                                    var len = Math.abs(fromY-toY)-1;
                                    var min = Math.min(fromY,toY);
                                    var n=0;
                                    for(var y=1;y<=len;y++){
                                        if(this.cell[min+y][toX].status!==1){
                                            n++;
                                        }
                                    }
                                    if(n==1){
                                        this.move(fromX,fromY,toX,toY,true);
                                    }else{
                                         alert('足球只能隔山打牛')
                                    }
                                }else if(fromY==toY){
                                    var len = Math.abs(fromX-toX)-1;
                                    var min = Math.min(fromX,toX);
                                    var n=0;
                                    for(var x=1;x<=len;x++){
                                        if(this.cell[toY][min+x].status!==1){
                                            n++;
                                        }
                                        if(n==1){
                                            this.move(fromX,fromY,toX,toY,true);
                                        }else{
                                            alert('足球只能隔山打牛')
                                        }
                                    }
                                }else{
                                    alert('打不到')
                                }
                                return;
                            }
                            if( (Math.abs(fromX-toX) == 1 && fromY == toY ) || ( Math.abs(fromY-toY) ==1 && fromX==toX)){
                                this.eat(fromX,fromY,toX,toY)
                            }else{
                                alert('太远了')
                            }
                            return;
                        }
                    }else{
                        if(col.role=='me'){
                            this.meActive=rowInd+','+colInd;
                        }else{
                            alert('不是你的棋子');
                        }
                    }
                },
                eat(fromX,fromY,toX,toY){
                    var from = this.cell[fromY][fromX];
                    var to = this.cell[toY][toX];
                    if(from.id==7 && to.id==1){
                        alert('打不过');
                        return;
                    }
                    if(from.id==1 && to.id==7){
                        this.move(fromX,fromY,toX,toY,true);
                        return
                    }
                    if(from.id>=to.id){
                        this.move(fromX,fromY,toX,toY,true);
                    }else{
                        alert('打不过')
                    }

                },
                move(fromX,fromY,toX,toY,eat,response){    //移动
                    var from = this.cell[fromY][fromX];
                    var to = this.cell[toY][toX];
                    this.$set(to,'id',from.id);
                    this.$set(to,'role',from.role);
                    this.$set(to,'status',2);
                    this.$set(from,'status',1);
                    if(response){
                        this.opPrev = fromY+','+fromX;
                        if(eat){
                            this.meProgress+=1;
                        }
                    }
                    console.log(to)
                    this.meActive='';
                    if(!response){
                        var data = {
                            type:eat ? 'eat' : 'move',
                            fromX,fromY,toX,toY
                        }
                        send('race',data,this.to_client_id);
                        if(eat){
                            this.opProgress+=1;
                        }
                    }
                    delete from.role;
                    delete from.id;
                    if(this.meProgress==14){
                         var confirm = window.confirm('你输了!');
                         location.reload();
                    }
                    if(this.opProgress==14){
                         var confirm = window.confirm('你赢了!');
                         location.reload();
                    }
                },
                createdCell(col,x,y){       //翻牌
                    var isMe =this.random(1,0);  //身份
                    isMe = this.chess[isMe].length ? isMe : (isMe ? 0 : 1);
                    var activeArr=this.chess[isMe];
                    var ind = this.random(activeArr.length-1,0); //随机下标
                    var id=activeArr[ind];
                    var role=isMe?'me':'op';
                    this.created(col,id,role);
                    var data = {
                        type:'created',
                        id:id,
                        role: role=='me' ? 'op' :'me',
                        x:x,
                        y:y
                    }
                    send('race',data,this.to_client_id)
                },
                created(col,id,role){
                    this.$set(col,'id',id);
                    this.$set(col,'role',role);
                    this.$set(col,'status',2);
                    var activeArr = role=='me' ? this.chess[1] : this.chess[0];
                    for(var i=0;i<activeArr.length;i++){
                        if(activeArr[i]==id){
                           activeArr.splice(i,1);
                            break;
                        }
                    }
                },
                response(data){
                    this.look=false;
                    this.meActive='';
                    if(data.type=='created'){
                        var col = this.cell[data.y][data.x];
                        this.created(col,data.id,data.role);
                    }else if(data.type=='eat'){
                        this.move(data.fromX,data.fromY,data.toX,data.toY,true,true);
                    }else if(data.type=='move'){
                         this.move(data.fromX,data.fromY,data.toX,data.toY,false,true);
                    }
                },
                connect(item,id){
                    send('connect',id);
                },
                editMyName(){
                    var name =  prompt('请输入昵称');
                    if(name){
                        name = name || "无名氏"
                        localStorage.setItem('uname',name);
                        this.myName=name;
                        location.reload();
                    }
                }
            },
            mounted(){
                var uname = localStorage.getItem('uname');
                var self = this;
                if(!uname){
                    var name =  prompt('请输入昵称');
                    name = name || "无名氏"
                    localStorage.setItem('uname',name);
                    uname=name;
                }
                self.myName=uname;
                socket = new WebSocket('ws://101.201.237.108:8383');
                socket.onmessage = function(res){
                    console.log('收到消息',res);
                     var data = eval("("+res.data+")");
                     switch(data['type']){
                        case 'init':
                            self.client_id=data.client_id;
                        break;
                        case "login" :
                            send('userList')
                        break;
                        case "userlist" :
                            self.userList=data.list;
                            if(self.status=='ongoing'){
                                return;
                            }
                            self.status="checkUser";
                        break;
                        case "connect" :  //收到邀请
                            if(self.status=='ongoing'){
                                return;
                            }
                            var confirm = window.confirm(data.invite);
                            if(confirm){
                                send('response',data.response_id);
                                self.to_client_id=data.response_id;
                                self.startGame();
                                self.look=false; //被邀请人先走
                            }
                        break;
                        case "response" :   //发起邀请对方确定
                            self.to_client_id=data.client_id;
                            self.startGame();
                            self.look=true; //被邀请人先走
                        break;
                        case "race" :
                            self.response(data.data);
                        break;
                        case "close" :
                            console.log('close',data)
                        break;
                     }
                }
                socket.onopen = function () {
                    send('login',uname);
                };
                socket.onerror=function(err){
                    console.log('ERROR',err)
                }
                socket.onclose = function () {
                  alert("连接已关闭...");
                };
            }
        })