/*
Navicat MySQL Data Transfer

Source Server         : mysql
Source Server Version : 50633
Source Host           : localhost:3306
Source Database       : node

Target Server Type    : MYSQL
Target Server Version : 50633
File Encoding         : 65001

Date: 2017-02-11 21:08:27
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for sl_manage
-- ----------------------------
DROP TABLE IF EXISTS `sl_manage`;
CREATE TABLE `sl_manage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '用户名',
  `pwd` varchar(255) DEFAULT NULL COMMENT '用户密码',
  `type` int(11) DEFAULT '0' COMMENT '管理员类型',
  `errtice` int(11) DEFAULT '0' COMMENT '错误次数',
  `errtime` date DEFAULT NULL COMMENT '错误时间',
  `thistime` datetime DEFAULT NULL COMMENT '本次登录时间',
  `lasttime` datetime DEFAULT NULL COMMENT '最后登录时间',
  `thisip` varchar(255) DEFAULT NULL COMMENT '本次登录IP',
  `lastip` varchar(255) DEFAULT NULL COMMENT '最后一次登录IP',
  `islock` int(1) DEFAULT '0' COMMENT '是否锁定账号',
  `email` varchar(255) DEFAULT NULL COMMENT '管理员邮箱',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sl_manage
-- ----------------------------
INSERT INTO `sl_manage` VALUES ('1', 'admin', '96e79218965eb72c92a549dd5a330112', '1', '0', '1999-01-01', '2017-02-11 20:15:07', '2017-02-11 20:01:13', '127.0.0.1', '127.0.0.1', '0', '');
INSERT INTO `sl_manage` VALUES ('2', 'zongshuxian', 'e10adc3949ba59abbe56e057f20f883e', '1', '0', null, null, null, null, null, '0', 'zongshuxian@51camp.cn');
INSERT INTO `sl_manage` VALUES ('3', 'EDIT', '96e79218965eb72c92a549dd5a330112', '3', '0', null, '2015-06-18 16:18:01', '2015-06-18 16:13:09', '123.123.4.94', '123.123.4.94', '0', 'chaijiexiu@51camp.cn');
INSERT INTO `sl_manage` VALUES ('4', 'test', 'e10adc3949ba59abbe56e057f20f883e', '2', '0', null, '2015-06-24 00:18:25', null, '123.121.83.229', null, '0', '');
INSERT INTO `sl_manage` VALUES ('5', 'product', '54a1bb781dfabf473238d4afbbabec74', '1', '0', null, '2015-07-01 11:15:33', '2015-07-01 10:53:29', '123.113.110.242', '123.113.110.242', '0', 'chaijiexiu@51camp.cn');

-- ----------------------------
-- Table structure for sl_sysmenu
-- ----------------------------
DROP TABLE IF EXISTS `sl_sysmenu`;
CREATE TABLE `sl_sysmenu` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL COMMENT '菜单标题',
  `allow` int(1) DEFAULT '0' COMMENT '是否启用',
  `pid` varchar(255) DEFAULT NULL COMMENT '所属上级菜单',
  `show` int(1) DEFAULT '0' COMMENT '是否展开',
  `url` varchar(255) DEFAULT NULL COMMENT '栏目路径',
  `sort` int(11) DEFAULT '0' COMMENT '排序',
  `remark` text COMMENT '备注',
  `icon` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=60 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Records of sl_sysmenu
-- ----------------------------
INSERT INTO `sl_sysmenu` VALUES ('1', '首页', '1', '0', '1', null, '10', null, null);
INSERT INTO `sl_sysmenu` VALUES ('2', '系统账号管理', '1', '1', '1', '', '0', '', 'icofont icofont-user-male');
INSERT INTO `sl_sysmenu` VALUES ('3', '管理员管理', '1', '2', '1', 'manage', '10', null, null);
INSERT INTO `sl_sysmenu` VALUES ('4', '修改管理密码', '1', '2', '1', 'manage/modify_pass', '0', '', '');
INSERT INTO `sl_sysmenu` VALUES ('5', '网站信息管理', '1', '1', '1', null, '20', null, null);
INSERT INTO `sl_sysmenu` VALUES ('6', '系统菜单', '1', '0', '1', null, '30', null, null);
INSERT INTO `sl_sysmenu` VALUES ('7', '工具箱', '1', '6', '1', '', '0', '', 'icofont icofont-tools-alt-2');
INSERT INTO `sl_sysmenu` VALUES ('8', '应用管理', '1', '7', '1', '../tool/?Ctl=apps', '10', null, null);
INSERT INTO `sl_sysmenu` VALUES ('9', '模型管理', '1', '7', '1', '../tool/?Ctl=index', '20', null, null);
INSERT INTO `sl_sysmenu` VALUES ('10', '模型列表', '1', '7', '1', '../tool/?Ctl=toollist', '30', null, null);
INSERT INTO `sl_sysmenu` VALUES ('11', '远程数据同步', '1', '7', '1', '../tool/?Ctl=synchr', '40', null, null);
INSERT INTO `sl_sysmenu` VALUES ('12', '系统菜单管理', '1', '7', '1', 'sysmenu', '50', null, null);
INSERT INTO `sl_sysmenu` VALUES ('13', '国内主题营', '1', '5', '1', 'sub_camp', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('14', '境外游学', '1', '5', '1', 'overseas', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('15', '全球营地', '1', '5', '1', 'global_camp', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('16', '营地教育', '1', '5', '1', 'camp_edu', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('17', '用户&订单', '1', '0', '1', '', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('18', '账号管理', '1', '17', '1', '', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('19', '会员管理', '1', '18', '1', 'member', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('20', '系统', '1', '0', '1', '', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('21', '公共字典', '1', '20', '1', '', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('22', '出发城市', '1', '21', '1', 'starting_city', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('23', '城市区域字典', '1', '21', '1', 'area?pid=0', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('24', '国内境外字典', '1', '20', '1', '', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('25', '项目主题', '1', '24', '1', 'theme', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('26', '项目类型', '1', '24', '1', 'camp_type', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('27', '适合年龄', '1', '21', '1', 'camp_age', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('28', '国内或境外目的地', '1', '24', '1', 'destination', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('29', '全球营地字典', '1', '20', '1', '', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('30', '营地国家', '1', '29', '1', 'camp_country', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('31', '营地周期', '1', '29', '1', 'camp_cycle', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('32', '消息管理', '1', '20', '1', '', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('33', '消息管理', '1', '32', '1', 'msg_list', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('34', '日志', '1', '20', '1', '', '50', '', null);
INSERT INTO `sl_sysmenu` VALUES ('35', '短信发送日志', '1', '34', '1', 'mb_code_log', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('36', '订单管理', '1', '17', '1', '', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('37', '会员订单', '1', '36', '1', 'order', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('38', '单页管理', '1', '0', '1', '', '50', '', null);
INSERT INTO `sl_sysmenu` VALUES ('39', '友情链接', '1', '1', '1', '', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('40', '友情链接', '1', '39', '1', 'partner?type=1', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('41', '合作支持', '1', '39', '1', 'partner?type=2', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('42', '滚播图片', '1', '1', '1', '', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('43', '首页滚播图片', '1', '42', '1', 'movepics', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('44', '营地教育滚播图片', '1', '42', '1', 'camp_movepics', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('45', '客服中心', '1', '20', '1', '', '60', '', null);
INSERT INTO `sl_sysmenu` VALUES ('46', '客服中心', '1', '45', '1', 'customer/edit?id=1', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('47', '管理组', '1', '2', '1', 'group', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('48', '权限节点', '0', '2', '1', 'node', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('49', '移动网站', '1', '0', '1', '', '60', '', null);
INSERT INTO `sl_sysmenu` VALUES ('50', '微信管理', '1', '49', '1', '', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('51', '首页滚动图片', '1', '50', '1', 'mb_movepics', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('52', '营地类别', '1', '29', '1', 'camp_category', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('53', '微信菜单', '1', '50', '1', 'wxmenu', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('54', '系统设置', '1', '20', '1', '', '70', '', null);
INSERT INTO `sl_sysmenu` VALUES ('55', '系统设置', '1', '54', '1', 'config/edit', '10', '', null);
INSERT INTO `sl_sysmenu` VALUES ('56', '自动回复', '1', '50', '1', 'auto', '30', '', null);
INSERT INTO `sl_sysmenu` VALUES ('57', '广告分类', '1', '58', '1', 'adpage', '40', '', null);
INSERT INTO `sl_sysmenu` VALUES ('58', '微信推广', '1', '49', '1', '', '20', '', null);
INSERT INTO `sl_sysmenu` VALUES ('59', '广告管理', '1', '58', '1', 'admanage', '50', '', null);
