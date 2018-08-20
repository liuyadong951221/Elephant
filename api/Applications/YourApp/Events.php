<?php
/**
 * This file is part of workerman.
 *
 * Licensed under The MIT License
 * For full copyright and license information, please see the MIT-LICENSE.txt
 * Redistributions of files must retain the above copyright notice.
 *
 * @author walkor<walkor@workerman.net>
 * @copyright walkor<walkor@workerman.net>
 * @link http://www.workerman.net/
 * @license http://www.opensource.org/licenses/mit-license.php MIT License
 */

/**
 * 用于检测业务代码死循环或者长时间阻塞等问题
 * 如果发现业务卡死，可以将下面declare打开（去掉//注释），并执行php start.php reload
 * 然后观察一段时间workerman.log看是否有process_timeout异常
 */
//declare(ticks=1);

use \GatewayWorker\Lib\Gateway;

/**
 * 主逻辑
 * 主要是处理 onConnect onMessage onClose 三个方法
 * onConnect 和 onClose 如果不需要可以不用实现并删除
 */
class Events
{
    /**
     * 当客户端连接时触发
     * 如果业务不需此回调可以删除onConnect
     * 
     * @param int $client_id 连接id
     */
    public static function onConnect($client_id)
    {
      // 向当前client_id发送数据 
      
      $message['client_id'] = $client_id;
      $message['type'] = 'init';

      Gateway::sendToClient($client_id, json_encode($message));


      

      // 向所有人发送
      // Gateway::sendToAll("$client_id login\r\n");
      
    }
    
   /**
    * 当客户端发来消息时触发
    * @param int $client_id 连接id
    * @param mixed $message 具体消息
    */
   public static function onMessage($client_id, $message)
   {  


      $req_data = json_decode($message, true);


      switch ($req_data['type']) {
        case 'login':
          
          self::login($client_id,$req_data);

          break;
        case 'userList':
          self::getUserlist($client_id,$req_data);
            break;
        case 'connect':
          self::connect($client_id,$req_data);
        break;
        case 'race':
          self::race($client_id,$req_data);
        break;

        case 'response':
          self::response($client_id,$req_data);
          break;

        default:
          # code...
          break;
      }

      // 向所有人发送 
      // Gateway::sendToAll("$client_id said $message\r\n");
   }
   
   /**
    * 当用户断开连接时触发
    * @param int $client_id 连接id
    */
   public static function onClose($client_id)
   {
       // 向所有人发送 
       // 
       
       $message['type'] = 'close';
       $message['client_id'] = $client_id;

       GateWay::sendToAll(json_encode($message));
   }


   /**
    * 初始化面板
    * @param  [type] $client_id [description]
    * @param  [type] $message   [description]
    * @return [type]            [description]
    */
   private static function login($client_id,$message)
   {
      
      //登录信息
      $message['mine']['name'] = $message['data'];
      $message['mine']['client_id'] = $client_id;

      //将用户名和客户端ID百行存储
      Gateway::setSession($client_id,['name'=>$message['data']]);

      //将所有用户的客户端id发送给当前登录用户
      GateWay::sendToClient($client_id,json_encode($message));

      $data['list'] = Gateway::getAllClientSessions();

      $data['type'] = 'userlist';

      GateWay::sendToAll(json_encode($message),null,[$client_id]);

   }


   /**
    * 获取用户列表
    * @param  [type] $client_id [description]
    * @param  [type] $message   [description]
    * @return [type]            [description]
    */
   private static function getUserlist($client_id,$message){

      //接收参数，返回所有用户列表

      $message['list'] = Gateway::getAllClientSessions();

      $message['type'] = 'userlist';

      GateWay::sendToClient($client_id,json_encode($message));

   }


   /**
    * 连接对方
    * @param  [type] $client_id [description]
    * @param  [type] $message   [description]
    * @return [type]            [description]
    */
   private static function connect($client_id,$message){


        $re_uid = $message['data'];

        $userName = GateWay::getSession($client_id)['name'];

        $message['invite'] = $userName.'对方请求与你一战';
        $message['response_id'] = $client_id;

        Gateway::sendToClient($re_uid,json_encode($message));

   }


   /**
    * 回应对战
    * @param  [type] $client_id [description]
    * @param  [type] $message   [description]
    * @return [type]            [description]
    */
   private static function response($client_id,$message)
   {
          
        $answer = $message['data'];

        $message['client_id'] = $client_id;

        GateWay::sendToClient($answer,json_encode($message));

   }


   /**
    * 比赛开始数据交互
    * @param  [type] $client_id [description]
    * @param  [type] $message   [description]
    * @return [type]            [description]
    */
   private static function race($client_id,$message)
   {
        
        $message['type'] = 'race';
        $message['data'] = $message['data'];

        GateWay::sendToClient($message['to_client_id'],json_encode($message));

   }

}
