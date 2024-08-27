'use strict'
;(self['webpackChunkkams'] = self['webpackChunkkams'] || []).push([
  [64],
  {
    4066: function (t, e, o) {
      o.d(e, {
        A: function () {
          return c
        }
      })
      var n = function () {
          var t = this,
            e = t._self._c
          return e('aside', { staticClass: 'k-sb-aside k-aside' }, [e('div', [t._t('default')], 2)])
        },
        s = [],
        i = { name: 'k-sb-aside' },
        r = i,
        a = o(8529),
        l = (0, a.A)(r, n, s, !1, null, null, null),
        c = l.exports
    },
    493: function (t, e, o) {
      o.d(e, {
        A: function () {
          return d
        }
      })
      var n = function () {
          var t = this,
            e = t._self._c
          return e('ul', { staticClass: 'k-menu', style: { flexDirection: this.mode } }, [t._t('default')], 2)
        },
        s = [],
        i = (o(381), o(4061)),
        r = o.n(i),
        a = {
          name: 'k-menu',
          data() {
            return { activeIndex: this.defaultActive }
          },
          provide() {
            return { root: this }
          },
          props: {
            activeColor: { type: String },
            activeShape: {
              type: Array,
              default() {
                return []
              }
            },
            backgroundColor: { type: String },
            textColor: {},
            mode: {
              type: String,
              default() {
                return 'column'
              }
            },
            defaultActive: { type: String },
            router: { type: Boolean }
          },
          methods: {
            changeRouteFn(t) {
              ;(this.activeIndex = t), this.router && this.$router.push(t)
            }
          },
          computed: {
            rootMenu() {
              return {
                activeColor: this.activeColor,
                backgroundColor: this.backgroundColor,
                activeIndex: this.defaultActive
              }
            }
          },
          watch: {
            defaultActive(t) {
              this.activeIndex = t
            }
          },
          beforeCreate() {
            this.$bus = new (r())()
          },
          mounted() {
            this.$bus.$on('changeRoute', this.changeRouteFn)
          },
          beforeDestroy() {
            this.$bus.$off('changeRoute', this.changeRouteFn)
          }
        },
        l = a,
        c = o(8529),
        u = (0, c.A)(l, n, s, !1, null, '13221647', null),
        d = u.exports
    },
    3850: function (t, e, o) {
      o.d(e, {
        A: function () {
          return c
        }
      })
      var n = function () {
          var t = this,
            e = t._self._c
          return e(
            'el-tooltip',
            {
              ref: 'tooltip',
              staticClass: 'item',
              attrs: { disabled: !t.tips, effect: 'dark', content: t.title, placement: 'right', manual: '' }
            },
            [
              e(
                'li',
                t._g(
                  {
                    staticClass: 'k-menu-item',
                    class: [{ className: t.className }, t.direction],
                    style: [t.itemStyle, { height: `${t.height}px`, minHeight: `${t.height}px` }],
                    on: { mouseenter: t.onmouseenterFn, mouseleave: t.onMouseLeaveFn, click: t.handleClickFn }
                  },
                  t.$listeners
                ),
                [
                  t.activeShape.includes('line')
                    ? [
                        e('transition', { attrs: { appear: '', name: 'appear' } }, [
                          e('div', {
                            directives: [{ name: 'show', rawName: 'v-show', value: t.active, expression: 'active' }],
                            staticClass: 'current-shape line',
                            style: { background: t.root.activeColor }
                          })
                        ])
                      ]
                    : t._e(),
                  t.activeShape.includes('circle')
                    ? [
                        e('transition', { attrs: { appear: '' } }, [
                          e('div', {
                            directives: [{ name: 'show', rawName: 'v-show', value: t.active, expression: 'active' }],
                            staticClass: 'current-shape circle',
                            style: [t.circleStyle]
                          })
                        ])
                      ]
                    : t._e(),
                  t._t('default')
                ],
                2
              )
            ]
          )
        },
        s = [],
        i = {
          name: 'k-menu-item',
          data() {
            return { activeColor: this.root.activeColor }
          },
          inject: ['root'],
          props: {
            icon: {
              type: String,
              default() {
                return ''
              }
            },
            index: { type: String },
            title: { type: String },
            width: {
              type: String,
              default() {
                return '70'
              }
            },
            height: {
              type: String,
              default() {
                return '70'
              }
            },
            className: {
              type: String,
              default() {
                return ''
              }
            }
          },
          methods: {
            onmouseenterFn() {
              ;(this.$el.style.backgroundColor = this.root.backgroundColor), this.handleTooltipFn(!0)
            },
            onMouseLeaveFn() {
              ;(this.activeShape.includes('background') && this.active) ||
                ((this.$el.style.backgroundColor = ''), this.handleTooltipFn(!1))
            },
            handleClickFn() {
              this.root.$bus.$emit('changeRoute', this.index), this.$emit('click', this)
            },
            handleTooltipFn(t) {
              this.$refs.tooltip.showPopper = t
            }
          },
          computed: {
            active() {
              if (!this.root.router) return this.root.activeIndex === this.index
              const t = this.root.activeIndex.split('/'),
                e = this.index.split('/')
              return t.includes(e[1])
            },
            itemStyle() {
              const t = {
                color: this.active ? this.root.activeColor : this.root.textColor,
                borderLeftColor: this.active ? this.root.activeColor : this.root.textColor,
                backgroundColor: ''
              }
              return (
                this.activeShape.includes('background') &&
                  (t.backgroundColor = this.active ? this.root.backgroundColor : ''),
                t
              )
            },
            circleStyle() {
              return { border: `3px solid ${this.activeColor};`, filter: `drop-shadow(0 0 4px ${this.activeColor});` }
            },
            activeShape() {
              return this.root.activeShape
            },
            tips() {
              return !!this.title
            },
            direction() {
              return `k-menu-item-${this.root.mode}`
            }
          },
          beforeMount() {},
          mounted() {}
        },
        r = i,
        a = o(8529),
        l = (0, a.A)(r, n, s, !1, null, '0353d388', null),
        c = l.exports
    },
    64: function (t, e, o) {
      o.r(e),
        o.d(e, {
          default: function () {
            return J
          }
        })
      var n = function () {
          var t = this,
            e = t._self._c
          return e(
            'el-container',
            { staticClass: 'main-container' },
            [
              e('k-aside'),
              e(
                'el-container',
                { attrs: { direction: 'vertical' } },
                [
                  e('k-header'),
                  e(
                    'el-main',
                    {
                      directives: [
                        { name: 'resize-ob', rawName: 'v-resize-ob', value: t.resizeFn, expression: 'resizeFn' }
                      ],
                      class: { isPadding: t.isPadding }
                    },
                    [e('keep-alive', { attrs: { include: 'kConsole' } }, [e('router-view')], 1)],
                    1
                  ),
                  t.isFooter ? e('k-footer') : t._e()
                ],
                1
              )
            ],
            1
          )
        },
        s = []
      o(381)
      function i(t) {
        return (
          (i =
            'function' == typeof Symbol && 'symbol' == typeof Symbol.iterator
              ? function (t) {
                  return typeof t
                }
              : function (t) {
                  return t && 'function' == typeof Symbol && t.constructor === Symbol && t !== Symbol.prototype
                    ? 'symbol'
                    : typeof t
                }),
          i(t)
        )
      }
      function r(t, e) {
        if ('object' != i(t) || !t) return t
        var o = t[Symbol.toPrimitive]
        if (void 0 !== o) {
          var n = o.call(t, e || 'default')
          if ('object' != i(n)) return n
          throw new TypeError('@@toPrimitive must return a primitive value.')
        }
        return ('string' === e ? String : Number)(t)
      }
      function a(t) {
        var e = r(t, 'string')
        return 'symbol' == i(e) ? e : e + ''
      }
      function l(t, e, o) {
        return (
          (e = a(e)) in t
            ? Object.defineProperty(t, e, { value: o, enumerable: !0, configurable: !0, writable: !0 })
            : (t[e] = o),
          t
        )
      }
      var c = o(4061),
        u = o.n(c),
        d = o(6193),
        h = o(646),
        p = o(982)
      const m = h.A.wsHost ?? '',
        v = `${m}/webui/${p.A.state.layoutOption.token}`
      u().prototype.$message = d.Message
      class f {
        constructor() {
          ;(this.status = 'offline'),
            (this.server = new WebSocket(v)),
            (this.server.onopen = this.onOpen.bind(this)),
            (this.server.onmessage = this.onMessage.bind(this)),
            (this.server.onerror = this.onError.bind(this)),
            (this.server.onclose = this.onClose.bind(this))
        }
        send(t, e) {
          e && e(t), this.server.send(JSON.stringify(t))
        }
        onOpen() {
          u().prototype.$message.success('WebSocket 服务器连接成功'), (this.status = 'online')
        }
        onMessage(t) {
          const e = JSON.parse(t.data),
            o = e.data
          'stats' === e.type &&
            (p.A.commit('webSocketOption/updateCpu', o.cpu), p.A.commit('webSocketOption/updateRam', o.ram))
        }
        onError(t) {
          u().prototype.$message.error(`WebSocket 发生错误：${String(t)}`), console.log(t)
        }
        onClose(t) {
          u().prototype.$message.warning(`WebSocket 服务器已断开，Code:${t.code}`),
            (this.status = 'offline'),
            p.A.commit('webSocketOption/updateCpu'),
            p.A.commit('webSocketOption/updateRam')
        }
        static create() {
          this.ws && this.ws.server.close(), (this.ws = new f())
        }
      }
      l(f, 'ws', void 0)
      var g = o(9335),
        b = function () {
          var t = this,
            e = t._self._c
          return e(
            'transition',
            [
              e(
                'el-aside',
                {
                  directives: [
                    {
                      name: 'show',
                      rawName: 'v-show',
                      value: !t.$store.state.layoutOption.isFoldAside,
                      expression: '!$store.state.layoutOption.isFoldAside'
                    }
                  ],
                  staticClass: 'k-aside'
                },
                [
                  e('div', { staticClass: 'logo' }, [e('img', { attrs: { src: o(3086), alt: '' } })]),
                  e(
                    'k-menu',
                    {
                      attrs: {
                        'default-active': t.$route.path,
                        'active-color': '#752bec',
                        'active-shape': ['line'],
                        'text-color': '#061e26',
                        'background-color': '#00000017',
                        mode: 'column',
                        tips: !0,
                        router: ''
                      }
                    },
                    t._l(t.menus, function (t, o) {
                      return e(
                        'k-menu-item',
                        { key: o, attrs: { index: t.indexPath, title: t.content, width: '60', height: '60' } },
                        [e('i', { class: t.icon })]
                      )
                    }),
                    1
                  ),
                  e('div', { staticClass: 'empty' }),
                  e('el-tooltip', { attrs: { effect: 'dark', content: '退出登录', placement: 'right' } }, [
                    e('div', { staticClass: 'quit' }, [
                      e('i', {
                        staticClass: 'el-icon-switch-button',
                        attrs: { slot: 'reference' },
                        on: { click: t.quitFn },
                        slot: 'reference'
                      })
                    ])
                  ])
                ],
                1
              )
            ],
            1
          )
        },
        k = [],
        F = o(9610),
        y = o(4066),
        C = o(3850),
        w = o(493),
        x = {
          name: 'k-aside',
          components: { kMenuItem: C.A, kMenu: w.A, kAside: y.A },
          data() {
            return {
              visible: !1,
              isShowDialog: !1,
              dialogData: { title: '提示', message: '确认退出登录？' },
              menus: [
                { icon: 'el-icon-data-analysis', content: '数据中心', indexPath: '/dataCenter' },
                { icon: 'el-icon-printer', content: '实例管理', indexPath: '/bots' },
                { icon: 'el-icon-folder-opened', content: '模块管理', indexPath: '/modules' },
                { icon: 'el-icon-shopping-bag-1', content: '模块中心', indexPath: '/modulesCenter' },
                { icon: 'el-icon-folder-opened', content: '指令管理', indexPath: '/command' },
                { icon: 'el-icon-setting', content: '配置查看', indexPath: '/config' },
                { icon: 'el-icon-cpu', content: '控制台', indexPath: '/console' }
              ]
            }
          },
          methods: {
            ...(0, g.mapMutations)('layoutOption', ['updateToken']),
            cancelFn() {
              this.isShowDialog = !1
            },
            quitFn() {
              this.$confirm(this.dialogData.message, this.dialogData.title, {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  ;(0, F.jd)()
                })
                .then(() => {
                  this.updateToken(''), this.$router.push('/login')
                })
                .catch(() => {
                  this.cancelFn()
                })
            }
          },
          mounted() {}
        },
        S = x,
        $ = o(8529),
        A = (0, $.A)(S, b, k, !1, null, '10de8e1e', null),
        _ = A.exports,
        P = function () {
          var t = this,
            e = t._self._c
          return e(
            'el-footer',
            { attrs: { height: '30px' } },
            [
              e('pps-context-menu', { attrs: { menus: t.menus, position: 'top' } }, [
                e('div', { staticClass: 'version detail', attrs: { slot: 'content' }, slot: 'content' }, [
                  e('div', { staticClass: 'kotori' }, [t._v('kotori v' + t._s(t.status.core))])
                ])
              ]),
              e(
                'pps-context-menu',
                {
                  attrs: {
                    menus: [
                      { label: '内存', rate: t.roundedRam.rate },
                      { label: 'CPU', rate: t.roundedCpu.rate }
                    ],
                    position: 'top'
                  },
                  scopedSlots: t._u([
                    {
                      key: 'item',
                      fn: function ({ scope: o }) {
                        return [
                          e(
                            'div',
                            { staticClass: 'rate' },
                            [
                              e('span', [t._v(t._s(o.label))]),
                              e('el-progress', { attrs: { percentage: Number(o.rate) } })
                            ],
                            1
                          )
                        ]
                      }
                    }
                  ])
                },
                [
                  e('div', { staticClass: 'status detail', attrs: { slot: 'content' }, slot: 'content' }, [
                    e('span', [t._v('内存:' + t._s(t.fixedFn(t.roundedRam.rate)) + ' %')]),
                    t._v('   '),
                    e('span', [t._v('CPU:' + t._s(t.fixedFn(t.roundedCpu.rate)) + ' %')])
                  ])
                ]
              )
            ],
            1
          )
        },
        O = [],
        q = {
          name: 'k-footer',
          data() {
            return { status: '' }
          },
          methods: {
            contextMenuFn() {},
            fixedFn(t) {
              return Number(t).toFixed(1)
            }
          },
          mounted() {
            ;(0, F.P8)().then(({ data: t }) => {
              this.status = t
            })
          },
          computed: {
            ...(0, g.mapGetters)('webSocketOption', ['roundedRam', 'roundedCpu']),
            menus() {
              return [
                { label: `主程序版本: v${this.status.main}` },
                { label: `核心版本: v${this.status.core}` },
                { label: `加载器版本: v${this.status.loader}` }
              ]
            }
          }
        },
        R = q,
        I = (0, $.A)(R, P, O, !1, null, 'ca8d8810', null),
        N = I.exports,
        E = function () {
          var t = this,
            e = t._self._c
          return e('el-header', [
            e(
              'span',
              { staticClass: 'header-left' },
              [
                e(
                  'pps-button',
                  {
                    nativeOn: {
                      click: function (e) {
                        return t.onFold()
                      }
                    }
                  },
                  [e('i', { class: t.arrowClass })]
                ),
                e(
                  'pps-button',
                  {
                    on: {
                      click: function (e) {
                        return t.toggleFullscreen()
                      }
                    }
                  },
                  [e('i', { staticClass: 'el-icon-full-screen' })]
                )
              ],
              1
            ),
            e('span', { staticClass: 'title header-center' }, [t._v(t._s(t.pathTitle))]),
            e(
              'span',
              { staticClass: 'header-right' },
              [
                e('pps-icon', { attrs: { icon: 'pps-icon-github' }, on: { click: t.linkGithubFn } }),
                e('pps-icon', { attrs: { icon: 'pps-icon-qq' }, on: { click: t.linkQQFn } }),
                e('pps-icon', { attrs: { icon: 'pps-icon-help' }, on: { click: t.linkDocsFn } })
              ],
              1
            )
          ])
        },
        D = []
      const M = {
        methods: {
          toggleFullscreen() {
            this.isFullscreen() ? this.exit() : this.enter(document.documentElement)
          },
          isFullscreen() {
            return (
              !!document.fullscreenElement ||
              !!document.webkitFullscreenElement ||
              !!document.mozFullScreenElement ||
              !!document.msFullscreenElement ||
              null
            )
          },
          enter(t) {
            t.requestFullscreen
              ? t.requestFullscreen()
              : t.webkitRequestFullscreen
                ? t.webkitRequestFullscreen()
                : t.mozRequestFullScreen
                  ? t.mozRequestFullScreen()
                  : t.msRequestFullscreen && t.msRequestFullscreen()
          },
          exit() {
            document.exitFullscreen
              ? document.exitFullscreen()
              : document.webkitExitFullscreen
                ? document.webkitExitFullscreen()
                : document.mozCancelFullScreen
                  ? document.mozCancelFullScreen()
                  : document.msExitFullscreen && document.msExitFullscreen()
          }
        }
      }
      var z = {
          name: 'kHeader',
          methods: {
            onFold() {
              this.$store.commit('layoutOption/updateIsFoldAside', !this.$store.state.layoutOption.isFoldAside)
            },
            clearvuexFn() {
              localStorage.removeItem('vuex')
            },
            linkGithubFn() {
              window.open('https://github.com/kotorijs', '_blank')
            },
            linkQQFn() {
              window.open('https://qm.qq.com/q/Nb3lQPt7We', '_blank')
            },
            linkDocsFn() {
              window.open('https://kotori.js.org/', '_blank')
            }
          },
          computed: {
            ...(0, g.mapGetters)('layoutOption', ['getIsFoldAside']),
            pathTitle() {
              return this.$route.matched[1].meta.title
            },
            isPadding() {
              return '/console' === this.$route.fullPath
            },
            arrowClass() {
              return this.getIsFoldAside ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'
            }
          },
          mixins: [M]
        },
        T = z,
        L = (0, $.A)(T, E, D, !1, null, null, null),
        j = L.exports,
        H = JSON.parse('{"HL":{"r":"^1.4.0"}}')
      const G = ['/console', '/sandBox']
      var Q = {
          name: 'myLayout',
          components: { kAside: _, kFooter: N, kHeader: j },
          data() {
            return { ws: null, isSmall: !1 }
          },
          provide() {
            return { layout: this }
          },
          methods: {
            handleAside() {
              G.includes(this.$route.fullPath) || this.isSmall
                ? this.$store.commit('layoutOption/updateIsFoldAside', !0)
                : this.$store.commit('layoutOption/updateIsFoldAside', !1)
            },
            resizeFn(t, e) {
              Math.floor(t) <= 428 ? (this.isSmall = !0) : (this.isSmall = !1)
            },
            async isVersionLatest() {
              return new Promise((t, e) => {
                ;(0, F.nI)().then(({ data: o }) => {
                  o['@kotori-bot/kotori-plugin-webui'] !== H.HL.r
                    ? (this.$message.error('当前版本过低，请更新webui插件'),
                      this.$route.path.includes('/login') || (this.$router.push('/login'), e(new Error('版本过低'))))
                    : t()
                })
              })
            }
          },
          mounted() {
            this.isVersionLatest()
              .then(() => {
                this.handleAside(),
                  (this.ws = new f()),
                  this.$store.dispatch('command/getCommands'),
                  this.$store.dispatch('modulesDetail/getData')
              })
              .catch(() => {})
          },
          beforeDestroy() {
            this.ws && this.ws.server.close()
          },
          updated() {
            this.isVersionLatest()
              .then(() => {
                this.handleAside()
              })
              .catch(() => {})
          },
          computed: {
            ...(0, g.mapGetters)('layoutOption', ['getIsFoldAside']),
            isPadding() {
              return !!G.includes(this.$route.fullPath)
            },
            isFooter() {
              return !G[0].includes(this.$route.fullPath)
            }
          }
        },
        W = Q,
        B = (0, $.A)(W, n, s, !1, null, 'f808f4ee', null),
        J = B.exports
    },
    3086: function (t, e, o) {
      t.exports = o.p + 'img/favicon.b107f5c1.svg'
    }
  }
])
//# sourceMappingURL=64.d4e04c78.js.map
