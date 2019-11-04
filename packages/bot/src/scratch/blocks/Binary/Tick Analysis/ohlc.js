import { localize } from 'deriv-translations/lib/translate';
import config       from '../../../../constants';

Blockly.Blocks.ohlc = {
    init() {
        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: localize('Candles List'),
            message1: localize('with interval: %1'),
            args1   : [
                {
                    type   : 'field_dropdown',
                    name   : 'CANDLEINTERVAL_LIST',
                    options: config.candleIntervals,
                },
            ],
            output         : 'Array',
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : localize('Returns a list of 1000 candles'),
            category       : Blockly.Categories.Tick_Analysis,
        };
    },
    meta(){
        return {
            'display_name': localize('Get candle list'),
            'description' : localize('This block returns the list of candles. Each candle has 4 properties: high, low, open, close, and open time.'),
        };
    },
};

Blockly.JavaScript.ohlc = block => {
    const selectedGranularity = block.getFieldValue('CANDLEINTERVAL_LIST');
    const granularity = selectedGranularity === 'default' ? 'undefined' : selectedGranularity;

    const code = `Bot.getOhlc({ granularity: ${granularity} })`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
