/*globals YAHOO */
XC.Test.Service.Roster = new YAHOO.tool.TestCase({
  name: 'XC Roster Service Tests',

  setUp: function () {
    this.conn = XC.Test.MockConnection.extend().init();
    this.xc = XC.Connection.extend({connectionAdapter: this.conn});
    this.xc.initConnection();

    this.Roster = this.xc.Roster;
  },

  tearDown: function () {
    delete this.conn;
    delete this.xc;
    delete this.Roster;
  },

  testMixin: function () {
    var Assert = YAHOO.util.Assert;
    Assert.mixesIn(this.Roster, XC.Mixin.HandlerRegistration);
  },

  testRequest: function () {
    var Assert = YAHOO.util.Assert;

    this.conn.addResponse(XC.Test.Packet.extendWithXML(
      '<iq to="marvin@heart-of-gold.com" \
           type="result" \
           id="test"> \
         <item jid="zaphod@heart-of-gold.com" \
               name="Zaphod"> \
           <group>President</group> \
         </item> \
         <item jid="ford@betelguice.net" \
               name="Ford Prefect"> \
           <group>Hitchhiker</group> \
         </item> \
      </iq>'
    ));

    var fail = false, win = false;
    this.Roster.requestItems({
      onSuccess: function (entities) {
        win = true;

        Assert.areEqual(entities[0].jid, "zaphod@heart-of-gold.com",
                        "The entity's jid is not what was expected.");
        Assert.areEqual(entities[0].roster.name, "Zaphod",
                        "The entity's name is not what was expected.");
        Assert.areEqual(entities[0].roster.groups[0], "President",
                        "The entity's group is not what was expected.");

        Assert.areEqual(entities[1].jid, "ford@betelguice.net",
                        "The entity's jid is not what was expected.");
        Assert.areEqual(entities[1].roster.name, "Ford Prefect",
                        "The entity's name is not what was expected.");
        Assert.areEqual(entities[1].roster.groups[0], "Hitchhiker",
                        "The entity's group is not what was expected.");
      },

      onError: function (packet) {
        fail = true;
      }
    });

    Assert.isTrue(win, "Was not successful in doing a roster request.");
    Assert.isFalse(fail, "Roster request threw an error.");
  },

  testRosterSetPush: function () {
    var Assert = YAHOO.util.Assert,
        fired,
        packet = XC.Test.Packet.extendWithXML(
          '<iq type="set" id="set1">'
          + '<query xmlns="jabber:iq:roster">'
            + '<item jid="ford@betelguice.net" name="Ford Prefect">'
              + '<group>Hitchhiker</group>'
            + '</item>'
            + '</query>'
            + '</iq>');

    this.xc.Roster.registerHandler('onRosterItem', function (entity) {
      fired = true;
      Assert.isString(entity.jid,
                      "The JID should be a String.");
      Assert.isString(entity.roster.name,
                      "The name should be a String.");
      Assert.isArray(entity.roster.groups,
                      "Groups should be an Array.");

      Assert.areEqual(entity.jid, 'ford@betelguice.net',
                      "The JID is incorrect.");
      Assert.areEqual(entity.roster.name, 'Ford Prefect',
                      "The name is incorrect.");
      Assert.areEqual(entity.roster.groups.length, 1,
                      "The number of groups is incorrect.");
      Assert.areEqual(entity.roster.groups[0], "Hitchhiker",
                      "The group is incorrect.");
    });

    this.conn.fireEvent('iq', packet);

    Assert.isTrue(fired, 'callback did not fire');
    Assert.XPathTests(this.conn._data, {
      type: {
        xpath: '/iq/@type',
        value: 'result'
      },
      checkID: {
        xpath: '/iq/@id',
        value: 'set1'
      },
      noChildren: {
        xpath: '/iq[0]',
        value: undefined
      }
    });

  },

  testRosterGet: function () {
    var Assert = YAHOO.util.Assert,
        packet = XC.Test.Packet.extendWithXML(
          '<iq type="result" id="result1"> \
             <query xmlns="jabber:iq:roster"> \
               <item jid="ford@betelguice.net" \
                     name="Ford Prefect"> \
                 <group>Hitchhiker</group> \
               </item> \
               <item jid="zaphod@heart-of-gold.com" \
                     name="Zaphod"> \
                 <group>President</group> \
                 <group>Imbecile</group> \
               </item> \
             </query> \
           </iq>');

    var count = 0;

    this.xc.Roster.registerHandler('onRosterItem', function (entity) {
      count++;
    });

    this.conn.fireEvent('iq', packet);
    Assert.isEqual(2, count, 'onRosterItem should be called twice');
  }

});

YAHOO.tool.TestRunner.add(XC.Test.Service.Roster);
