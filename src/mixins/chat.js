/**
 * @class
 * One-to-one Chatting
 * @extends XC.Base
 *
 * @see <a href="http://ietf.org/rfc/rfc3921.txt">RFC 3921: XMPP IM; Section 4</a>
 */
XC.Mixin.Chat = XC.Base.extend(/** @lends XC.Mixin.Chat# */{

  /**
   * Send a chat message to another entity.
   *
   * @param {String} [body]      The body of the message.
   * @param {String} [subject]   The subject of the message.
   * @param {String} [thread]    The thread of the message.
   * @param {String} [id]        The id of the message.
   * @returns {XC.MessageStanza}
   */
  sendChat: function (body, subject, thread, id) {
    var msg = this.connection.MessageStanza.extend({
	            type: 'chat',
                body: body,
                subject: subject,
                thread: thread,
                to: this,
				from: this.connection.Entity.extend({jid: this.connection.getJID()}),
                id: id
              });
	msg.send();
	
	return msg;
  }

});
