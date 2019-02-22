/**
 * @module radspec/helpers/HelperManager
 */

/**
 * Class for managing the execution of helper functions
 *
 * @class HelperManager
 * @param {Object} availableHelpers Defined helpers
 */
export default class HelperManager {
  constructor (availableHelpers = {}) {
    this.availableHelpers = availableHelpers
  }

  /**
   * Does a helper exist
   *
   * @param  {string} helper Helper name
   * @return {bool}
   */
  exists (helper) {
    return !!this.availableHelpers[helper]
  }

  /**
   * Execute a helper with some inputs
   *
   * @param  {string} helper Helper name
   * @param  {Array<radspec/evaluator/TypedValue>} inputs
   * @param  {Object} config Configuration for running helper
   * @param  {Web3}                        config.eth Web3 instance
   * @param  {radspec/evaluator/Evaluator} config.evaluator Current evaluator
   * @return {Promise<radspec/evaluator/TypedValue>}
   */
  execute (helper, inputs, { eth, evaluator }) {
    inputs = inputs.map(input => input.value) // pass values directly
    return this.availableHelpers[helper](eth, evaluator)(...inputs)
  }

  /**
   * Get all registered helpers as a key-value mapping
   *
   * @return {Object}
   */
  getHelpers () {
    return this.availableHelpers
  }
}
