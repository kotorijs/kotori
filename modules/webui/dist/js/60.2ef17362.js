'use strict'
;(self['webpackChunkkams'] = self['webpackChunkkams'] || []).push([
  [60],
  {
    1349: function (t, e, n) {
      n.d(e, {
        A: function () {
          return c
        }
      })
      var i = function () {
          var t = this,
            e = t._self._c
          return e('aside', { ref: 'aside', staticClass: 'k-sb-aside k-aside' }, [
            e('div', { staticClass: 'k-aside-default' }, [t._t('default')], 2),
            e('div', { staticClass: 'k-aside-inner' }, [t._t('inner')], 2)
          ])
        },
        s = [],
        o = { name: 'k-sb-aside' },
        r = o,
        a = n(1656),
        l = (0, a.A)(r, i, s, !1, null, null, null),
        c = l.exports
    },
    4844: function (t, e, n) {
      n.d(e, {
        A: function () {
          return u
        }
      })
      var i = function () {
          var t = this,
            e = t._self._c
          return e('ul', { staticClass: 'k-menu', style: { flexDirection: this.mode } }, [t._t('default')], 2)
        },
        s = [],
        o = (n(4114), n(6848)),
        r = {
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
              this.router && this.$router.push(t), (this.activeIndex = t)
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
            this.$bus = new o['default']()
          },
          mounted() {
            this.$bus.$on('changeRoute', this.changeRouteFn)
          },
          beforeDestroy() {
            this.$bus.$off('changeRoute', this.changeRouteFn)
          }
        },
        a = r,
        l = n(1656),
        c = (0, l.A)(a, i, s, !1, null, '8321ac56', null),
        u = c.exports
    },
    2222: function (t, e, n) {
      n.d(e, {
        A: function () {
          return c
        }
      })
      var i = function () {
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
                {
                  staticClass: 'k-menu-item',
                  class: [{ className: t.className }, { active: t.active }, t.direction],
                  style: [
                    t.itemStyle,
                    { height: `${t.height}px`, minHeight: `${t.height}px` },
                    { justifyContent: t.align }
                  ],
                  on: { mouseenter: t.onmouseenterFn, mouseleave: t.onMouseLeaveFn, click: t.handleClickFn }
                },
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
                            style: t.circleStyle
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
        o = {
          name: 'k-menu-item',
          data() {
            return { activeColor: this.root.activeColor }
          },
          inject: ['root'],
          methods: {
            onmouseenterFn() {
              ;(this.$el.style.backgroundColor = this.root.backgroundColor), this.handleTooltipFn(!0)
            },
            onMouseLeaveFn() {
              ;(this.activeShape.includes('background') && this.active) ||
                ((this.$el.style.backgroundColor = ''), this.handleTooltipFn(!1))
            },
            handleClickFn() {
              this.root.$bus.$emit('changeRoute', this.index),
                this.$emit('click', this),
                this.root.$emit('select', this)
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
              return {
                border: `3px solid ${this.root.activeColor}`,
                filter: `drop-shadow(0 0 4px ${this.root.activeColor})`
              }
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
          mounted() {},
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
            },
            align: {
              type: String,
              default() {
                return 'center'
              }
            }
          }
        },
        r = o,
        a = n(1656),
        l = (0, a.A)(r, i, s, !1, null, 'dbebb810', null),
        c = l.exports
    },
    9060: function (t, e, n) {
      n.r(e),
        n.d(e, {
          default: function () {
            return M
          }
        })
      var i = function () {
          var t = this,
            e = t._self._c
          return e(
            'el-container',
            {
              directives: [{ name: 'resize-ob', rawName: 'v-resize-ob', value: t.resizeFn, expression: 'resizeFn' }],
              staticClass: 'main-container'
            },
            [
              e('k-aside'),
              e(
                'el-container',
                { staticClass: 'kams-main-container', attrs: { direction: 'vertical' } },
                [
                  e('k-header'),
                  e(
                    'el-main',
                    { class: { isPadding: t.isPadding, lessPadding: t.getIsNarrowScreen } },
                    [
                      e(
                        'transition',
                        { attrs: { name: 'pps', mode: 'out-in' } },
                        [e('keep-alive', { attrs: { include: 'kConsole' } }, [e('router-view')], 1)],
                        1
                      )
                    ],
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
        s = [],
        o = (n(4114), n(3518)),
        r = function () {
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
                  e('div', { staticClass: 'logo' }, [e('img', { attrs: { src: n(3086), alt: '' } })]),
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
                    t._l(t.menus, function (t, n) {
                      return e(
                        'k-menu-item',
                        { key: n, attrs: { index: t.indexPath, title: t.content, width: '60', height: '60' } },
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
        a = [],
        l = n(1552),
        c = n(1349),
        u = n(2222),
        d = n(4844),
        h = {
          name: 'k-aside',
          components: { kMenuItem: u.A, kMenu: d.A, kAside: c.A },
          data() {
            return {
              visible: !1,
              isShowDialog: !1,
              dialogData: { title: '提示', message: '确认退出登录？' },
              menus: [
                { icon: 'el-icon-pie-chart', content: '数据中心', indexPath: '/dataCenter' },
                { icon: 'el-icon-printer', content: '实例管理', indexPath: '/bots' },
                { icon: 'el-icon-files', content: '模块管理', indexPath: '/modules' },
                { icon: 'el-icon-shopping-bag-1', content: '模块中心', indexPath: '/modulesCenter' },
                { icon: 'el-icon-set-up', content: '指令管理', indexPath: '/command' },
                { icon: 'el-icon-setting', content: '配置查看', indexPath: '/config' },
                { icon: 'el-icon-chat-line-square', content: '沙盒测试', indexPath: '/sandBox' },
                { icon: 'el-icon-cpu', content: '控制台', indexPath: '/console' }
              ]
            }
          },
          methods: {
            ...(0, o.PY)('layoutOption', ['updateToken']),
            cancelFn() {
              this.isShowDialog = !1
            },
            quitFn() {
              this.$dialog({ content: this.dialogData.message, title: this.dialogData.title })
                .then(() => {
                  ;(0, l.jd)()
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
        p = h,
        m = n(1656),
        v = (0, m.A)(p, r, a, !1, null, '20b675e9', null),
        f = v.exports,
        g = function () {
          var t = this,
            e = t._self._c
          return e(
            'el-footer',
            { attrs: { height: '30px' } },
            [
              e('pps-context-menu', { attrs: { menus: t.menus, position: 'top' } }, [
                e('div', { staticClass: 'version detail', attrs: { slot: 'content' }, slot: 'content' }, [
                  e('div', { staticClass: 'kotori' }, [
                    'dev' === t.status?.mode
                      ? e(
                          'strong',
                          {
                            staticStyle: {
                              padding: '1px',
                              'border-radius': '3px',
                              border: '1px solid #ff9955',
                              color: '#fff',
                              'background-color': '#ff9955'
                            }
                          },
                          [t._v('Dev')]
                        )
                      : t._e(),
                    t._v(' kams v' + t._s(t.version)),
                    t.screenWidth > 440 ? e('span', [t._v(' kotori v' + t._s(t.status?.main))]) : t._e(),
                    t.screenWidth > 570 ? e('span', [t._v(' loader v' + t._s(t.status?.loader))]) : t._e()
                  ])
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
                      fn: function ({ menu: n }) {
                        return t._l(n, function (n, i) {
                          return e('div', { key: i, staticClass: 'menu-item' }, [
                            e(
                              'div',
                              { staticClass: 'rate' },
                              [
                                e('span', [t._v(t._s(n.label))]),
                                e('el-progress', { attrs: { percentage: Number(n.rate) } })
                              ],
                              1
                            )
                          ])
                        })
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
        k = [],
        b = { rE: '1.5.2' },
        C = {
          name: 'k-footer',
          data() {
            return { status: '', version: b.rE, screenWidth: window.innerWidth }
          },
          methods: {
            ...(0, o.PY)('webSocketOption', ['updateCpu', 'updateRam']),
            contextMenuFn() {},
            fixedFn(t) {
              return Number(t).toFixed(1)
            }
          },
          computed: {
            ...(0, o.L8)('webSocketOption', ['roundedRam', 'roundedCpu']),
            menus() {
              return [
                { label: `主程序版本: v${this.status.main}` },
                { label: `核心版本: v${this.status.core}` },
                { label: `加载器版本: v${this.status.loader}` }
              ]
            }
          },
          created() {
            ;(0, l.P8)().then(({ data: t }) => {
              this.status = t
            })
          },
          mounted() {
            this.$ws.bus.$on('wsMessage', (t) => {
              'stats' === t.type && (this.updateCpu(t.data.cpu), this.updateRam(t.data.ram))
            })
          },
          beforeDestroy() {
            this.$ws.bus.$off('wsMessage')
          }
        },
        F = C,
        x = (0, m.A)(F, g, k, !1, null, 'fc9fc340', null),
        y = x.exports,
        w = function () {
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
        $ = [],
        _ = n(9529),
        S = {
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
            ...(0, o.L8)('layoutOption', ['getIsFoldAside']),
            pathTitle() {
              return this.$route.matched[1].meta.title
            },
            isPadding() {
              return '/console' === this.$route.path
            },
            arrowClass() {
              return this.getIsFoldAside ? 'el-icon-d-arrow-right' : 'el-icon-d-arrow-left'
            }
          },
          mixins: [_.U]
        },
        A = S,
        P = (0, m.A)(A, w, $, !1, null, null, null),
        I = P.exports
      const q = ['/console', '/sandBox']
      var R = {
          name: 'myLayout',
          components: { kAside: f, kFooter: y, kHeader: I },
          data() {
            return {}
          },
          methods: {
            ...(0, o.i0)('modulesDetail', { getModules: 'getData' }),
            ...(0, o.i0)('command', ['getCommands']),
            handleAside() {
              q.includes(this.$route.path) || this.isSmall
                ? this.$store.commit('layoutOption/updateIsFoldAside', !0)
                : this.$store.commit('layoutOption/updateIsFoldAside', !1)
            },
            resizeFn(t, e) {
              Math.floor(t) <= 528
                ? this.$store.commit('layoutOption/updateIsNarrowScreen', !0)
                : this.$store.commit('layoutOption/updateIsNarrowScreen')
            },
            async isVersionLatest() {
              return new Promise((t, e) => {
                ;(0, l.nI)().then(({ data: n }) => {
                  const i = n['@kotori-bot/kotori-plugin-webui'].slice(1).split('.').join(''),
                    s = b.rE.split('.').join('')
                  s < i
                    ? (this.$message.error('当前版本过低，请更新webui插件'),
                      this.$route.path.includes('/login') ||
                        (this.$store.commit('layoutOption/updateToken'), this.$router.push('/login')),
                      e(new Error('版本过低')))
                    : t()
                })
              })
            }
          },
          mounted() {},
          created() {
            this.getCommands(),
              this.getModules(),
              this.isVersionLatest()
                .then(() => {
                  this.handleAside(), this.$ws.init()
                })
                .catch(() => {})
          },
          beforeDestroy() {
            console.log('layout beforeDestroy'), this.$ws.instance && this.$ws.close()
          },
          updated() {
            this.isVersionLatest()
              .then(() => {
                this.handleAside()
              })
              .catch(() => {})
          },
          computed: {
            ...(0, o.L8)('layoutOption', ['getIsFoldAside', 'getIsNarrowScreen']),
            isPadding() {
              return !!q.includes(this.$route.path)
            },
            isFooter() {
              return !q[0].includes(this.$route.path)
            }
          }
        },
        O = R,
        D = (0, m.A)(O, i, s, !1, null, '9f713dae', null),
        M = D.exports
    },
    9529: function (t, e, n) {
      n.d(e, {
        B: function () {
          return s
        },
        U: function () {
          return i
        }
      })
      const i = {
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
        },
        s = {
          props: {
            chatTarget: {
              type: Object,
              default() {
                return null
              }
            },
            memberList: {
              type: Array,
              default() {
                return []
              }
            }
          },
          methods: {
            tranRoleFn(t) {
              const e = { lord: '群主', admin: '管理员', 'super-admin': 'bot', expellee: '已退群' }
              return e[t] || ''
            },
            avatarContextMenuFn(t) {
              const { uid: e, task: n, key: i } = t
              if (n) {
                const t = this.admin.getUserById(e)
                this.$emit('handleMenuAction', { targetUser: t, actionType: i, groupId: this.chatTarget.id })
              }
            }
          }
        }
    },
    3086: function (t, e, n) {
      t.exports = n.p + 'img/favicon.b107f5c1.svg'
    }
  }
])
//# sourceMappingURL=60.2ef17362.js.map
