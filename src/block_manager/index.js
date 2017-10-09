/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [getCategories](#getcategories)
 * * [getContainer](#getcontainer)
 * * [render](#render)
 *
 * Block manager helps managing various, draggable, piece of contents that could be easily reused inside templates.
 *
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var blockManager = editor.BlockManager;
 * ```
 *
 * @module BlockManager
 * @param {Object} config Configurations
 * @param {Array<Object>} [config.blocks=[]] Default blocks
 * @example
 * ...
 * {
 *     blocks: [
 *      {id:'h1-block' label: 'Heading', content:'<h1>...</h1>'},
 *      ...
 *    ],
 * }
 * ...
 */
module.exports = () => {
  var c = {},
  defaults = require('./config/config'),
  Blocks = require('./model/Blocks'),
  BlockCategories = require('./model/Categories'),
  BlocksView = require('./view/BlocksView');
  var blocks, blocksVisible, blocksView;
  var categories = [];

  return {

      /**
       * Name of the module
       * @type {String}
       * @private
       */
      name: 'BlockManager',

      /**
       * Initialize module. Automatically called with a new instance of the editor
       * @param {Object} config Configurations
       * @return {this}
       * @private
       */
      init(config) {
        c = config || {};
        const em = c.em;

        for (let name in defaults) {
          if (!(name in c)) {
            c[name] = defaults[name];
          }
        }

        // Global blocks collection
        blocks = new Blocks([]);
        blocksVisible = new Blocks([]);
        categories = new BlockCategories(),
        blocksView = new BlocksView({
          // Visible collection
          collection: blocksVisible,
          categories,
        }, c);

        // Setup the sync between the global and public collections
        blocks.listenTo(blocks, 'add', model => {
          blocksVisible.add(model);
          em && em.trigger('block:add', model);
        });

        blocks.listenTo(blocks, 'remove', model => {
          blocksVisible.remove(model);
          em && em.trigger('block:remove', model);
        });

        blocks.listenTo(blocks, 'reset', coll => {
          blocksVisible.reset(coll.models);
        });

        return this;
      },

      /**
       * Get configuration object
       * @return {Object}
       */
      getConfig() {
        return c;
      },

      /**
       * Loading blocks with `onLoad` allows to init starting collection
       * from plugins
       */
      onLoad() {
        console.log('On load', c.blocks);
        this.getAll().reset(c.blocks);
      },

      /**
       * Add new block to the collection.
       * @param {string} id Block id
       * @param {Object} opts Options
       * @param {string} opts.label Name of the block
       * @param {string} opts.content HTML content
       * @param {string|Object} opts.category Group the block inside a catgegory.
       *                                      You should pass objects with id property, eg:
       *                                      {id: 'some-uid', label: 'My category'}
       *                                      The string will be converted in:
       *                                      'someid' => {id: 'someid', label: 'someid'}
       * @param {Object} [opts.attributes={}] Block attributes
       * @return {Block} Added block
       * @example
       * blockManager.add('h1-block', {
       *   label: 'Heading',
       *   content: '<h1>Put your title here</h1>',
       *   category: 'Basic',
       *   attributes: {
       *     title: 'Insert h1 block'
       *   }
       * });
       */
      add(id, opts) {
        var obj = opts || {};
        obj.id = id;
        return blocks.add(obj);
      },

      /**
       * Return the block by id
       * @param  {string} id Block id
       * @example
       * const block = blockManager.get('h1-block');
       * console.log(JSON.stringify(block));
       * // {label: 'Heading', content: '<h1>Put your ...', ...}
       */
      get(id) {
        return blocks.get(id);
      },

      /**
       * Return all blocks
       * @return {Collection}
       * @example
       * const blocks = blockManager.getAll();
       * console.log(JSON.stringify(blocks));
       * // [{label: 'Heading', content: '<h1>Put your ...'}, ...]
       */
      getAll() {
        return blocks;
      },

      /**
       * Return the visible collection, which containes blocks actually rendered
       * @return {Collection}
       */
      getAllVisible() {
        return blocksVisible;
      },

      /**
       * Remove a block by id
       * @param {string} id Block id
       * @return {Block} Removed block
       */
      remove(id) {
        return blocks.remove(id);
      },

      /**
       * Get all available categories.
       * It's possible to add categories only within blocks via 'add()' method
       * @return {Array|Collection}
       */
      getCategories() {
        return categories;
      },

      /**
       * Return the Blocks container element
       * @return {HTMLElement}
       */
      getContainer() {
        return blocksView.el;
      },

      /**
       * Render blocks
       * @param  {Array} blocks Blocks to render, without the argument will render
       *                        all global blocks
       * @example
       * // Render all blocks
       * blockManager.render();
       *
       * // Render some blocks
       * const blocks = blockManager.getAll();
       * blockManager.render(blocks.filter(
       *  block => block.get('category') == 'sections'
       * ));
       */
      render(blocks) {
        const toRender = blocks || this.getAll().models;

        if (!blocksView.rendered) {
          blocksView.render();
          blocksView.rendered = 1;
        }

        blocksView.collection.reset(toRender);
      },

  };

};
