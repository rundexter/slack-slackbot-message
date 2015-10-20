var request = require('superagent')
  , async   = require('async')
;

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var channel = step.input('channel')
          , message = step.input('text').first()
          , token   = step.input('token').first()
          , team    = step.input('team').first()
          , self    = this
        ;

        if(!team)            return this.fail('Team is required.');
        if(!token)           return this.fail('Token is required.');
        if(!channel.first()) return this.fail('Channel is required.');
        if(!message)         return this.fail('Message is required.');

        async.mapSeries(channel
            //forEach channel execute this
            , function(channel, cb) {
                self.log(channel);
                if(channel) {
                    var url = 'https://'+team+'.slack.com/services/hooks/slackbot?token='+token+'&channel='+encodeURIComponent(channel);
                    self.log('POSTing '+url);
                    request.post(url)
                        .send(message)
                        .end(function(err, res) {
                            cb(err, res);
                        });
                }
            }
            //when all are complete execute this
            , function(err, results) {
                return err 
                    ? self.fail({ error: err, message: 'An error occurred processing an item.'})
                    : self.complete({});
            }
        );
    }
};
