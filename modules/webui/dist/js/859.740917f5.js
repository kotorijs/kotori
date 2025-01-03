"use strict";
(self["webpackChunkkams"] = self["webpackChunkkams"] || []).push([
  [859],
  {
    4066: function (t, e, s) {
      s.d(e, {
        A: function () {
          return c;
        },
      });
      var i = function () {
          var t = this,
            e = t._self._c;
          return e("aside", { staticClass: "k-sb-aside k-aside" }, [
            e("div", [t._t("default")], 2),
          ]);
        },
        n = [],
        o = { name: "k-sb-aside" },
        a = o,
        r = s(8529),
        l = (0, r.A)(a, i, n, !1, null, null, null),
        c = l.exports;
    },
    493: function (t, e, s) {
      s.d(e, {
        A: function () {
          return d;
        },
      });
      var i = function () {
          var t = this,
            e = t._self._c;
          return e(
            "ul",
            { staticClass: "k-menu", style: { flexDirection: this.mode } },
            [t._t("default")],
            2
          );
        },
        n = [],
        o = (s(381), s(4061)),
        a = s.n(o),
        r = {
          name: "k-menu",
          data() {
            return { activeIndex: this.defaultActive };
          },
          provide() {
            return { root: this };
          },
          props: {
            activeColor: { type: String },
            activeShape: {
              type: Array,
              default() {
                return [];
              },
            },
            backgroundColor: { type: String },
            textColor: {},
            mode: {
              type: String,
              default() {
                return "column";
              },
            },
            defaultActive: { type: String },
            router: { type: Boolean },
          },
          methods: {
            changeRouteFn(t) {
              (this.activeIndex = t), this.router && this.$router.push(t);
            },
          },
          computed: {
            rootMenu() {
              return {
                activeColor: this.activeColor,
                backgroundColor: this.backgroundColor,
                activeIndex: this.defaultActive,
              };
            },
          },
          watch: {
            defaultActive(t) {
              this.activeIndex = t;
            },
          },
          beforeCreate() {
            this.$bus = new (a())();
          },
          mounted() {
            this.$bus.$on("changeRoute", this.changeRouteFn);
          },
          beforeDestroy() {
            this.$bus.$off("changeRoute", this.changeRouteFn);
          },
        },
        l = r,
        c = s(8529),
        u = (0, c.A)(l, i, n, !1, null, "13221647", null),
        d = u.exports;
    },
    3850: function (t, e, s) {
      s.d(e, {
        A: function () {
          return c;
        },
      });
      var i = function () {
          var t = this,
            e = t._self._c;
          return e(
            "el-tooltip",
            {
              ref: "tooltip",
              staticClass: "item",
              attrs: {
                disabled: !t.tips,
                effect: "dark",
                content: t.title,
                placement: "right",
                manual: "",
              },
            },
            [
              e(
                "li",
                t._g(
                  {
                    staticClass: "k-menu-item",
                    class: [{ className: t.className }, t.direction],
                    style: [
                      t.itemStyle,
                      { height: `${t.height}px`, minHeight: `${t.height}px` },
                    ],
                    on: {
                      mouseenter: t.onmouseenterFn,
                      mouseleave: t.onMouseLeaveFn,
                      click: t.handleClickFn,
                    },
                  },
                  t.$listeners
                ),
                [
                  t.activeShape.includes("line")
                    ? [
                        e(
                          "transition",
                          { attrs: { appear: "", name: "appear" } },
                          [
                            e("div", {
                              directives: [
                                {
                                  name: "show",
                                  rawName: "v-show",
                                  value: t.active,
                                  expression: "active",
                                },
                              ],
                              staticClass: "current-shape line",
                              style: { background: t.root.activeColor },
                            }),
                          ]
                        ),
                      ]
                    : t._e(),
                  t.activeShape.includes("circle")
                    ? [
                        e("transition", { attrs: { appear: "" } }, [
                          e("div", {
                            directives: [
                              {
                                name: "show",
                                rawName: "v-show",
                                value: t.active,
                                expression: "active",
                              },
                            ],
                            staticClass: "current-shape circle",
                            style: [t.circleStyle],
                          }),
                        ]),
                      ]
                    : t._e(),
                  t._t("default"),
                ],
                2
              ),
            ]
          );
        },
        n = [],
        o = {
          name: "k-menu-item",
          data() {
            return { activeColor: this.root.activeColor };
          },
          inject: ["root"],
          props: {
            icon: {
              type: String,
              default() {
                return "";
              },
            },
            index: { type: String },
            title: { type: String },
            width: {
              type: String,
              default() {
                return "70";
              },
            },
            height: {
              type: String,
              default() {
                return "70";
              },
            },
            className: {
              type: String,
              default() {
                return "";
              },
            },
          },
          methods: {
            onmouseenterFn() {
              (this.$el.style.backgroundColor = this.root.backgroundColor),
                this.handleTooltipFn(!0);
            },
            onMouseLeaveFn() {
              (this.activeShape.includes("background") && this.active) ||
                ((this.$el.style.backgroundColor = ""),
                this.handleTooltipFn(!1));
            },
            handleClickFn() {
              this.root.$bus.$emit("changeRoute", this.index),
                this.$emit("click", this);
            },
            handleTooltipFn(t) {
              this.$refs.tooltip.showPopper = t;
            },
          },
          computed: {
            active() {
              if (!this.root.router)
                return this.root.activeIndex === this.index;
              const t = this.root.activeIndex.split("/"),
                e = this.index.split("/");
              return t.includes(e[1]);
            },
            itemStyle() {
              const t = {
                color: this.active
                  ? this.root.activeColor
                  : this.root.textColor,
                borderLeftColor: this.active
                  ? this.root.activeColor
                  : this.root.textColor,
                backgroundColor: "",
              };
              return (
                this.activeShape.includes("background") &&
                  (t.backgroundColor = this.active
                    ? this.root.backgroundColor
                    : ""),
                t
              );
            },
            circleStyle() {
              return {
                border: `3px solid ${this.activeColor};`,
                filter: `drop-shadow(0 0 4px ${this.activeColor});`,
              };
            },
            activeShape() {
              return this.root.activeShape;
            },
            tips() {
              return !!this.title;
            },
            direction() {
              return `k-menu-item-${this.root.mode}`;
            },
          },
          beforeMount() {},
          mounted() {},
        },
        a = o,
        r = s(8529),
        l = (0, r.A)(a, i, n, !1, null, "0353d388", null),
        c = l.exports;
    },
    1859: function (t, e, s) {
      s.r(e),
        s.d(e, {
          default: function () {
            return E;
          },
        });
      var i = function () {
          var t = this,
            e = t._self._c;
          return e(
            "el-container",
            {
              directives: [
                {
                  name: "resize-ob",
                  rawName: "v-resize-ob",
                  value: t.resizeFn,
                  expression: "resizeFn",
                },
              ],
              staticClass: "main-container",
            },
            [
              e("k-aside"),
              e(
                "el-container",
                { attrs: { direction: "vertical" } },
                [
                  e("k-header"),
                  e(
                    "el-main",
                    {
                      class: { isPadding: t.isPadding, lessPadding: t.isSmall },
                    },
                    [
                      e(
                        "keep-alive",
                        { attrs: { include: "kConsole" } },
                        [e("router-view")],
                        1
                      ),
                    ],
                    1
                  ),
                  t.isFooter ? e("k-footer") : t._e(),
                ],
                1
              ),
            ],
            1
          );
        },
        n = [],
        o = (s(381), s(9335)),
        a = function () {
          var t = this,
            e = t._self._c;
          return e(
            "transition",
            [
              e(
                "el-aside",
                {
                  directives: [
                    {
                      name: "show",
                      rawName: "v-show",
                      value: !t.$store.state.layoutOption.isFoldAside,
                      expression: "!$store.state.layoutOption.isFoldAside",
                    },
                  ],
                  staticClass: "k-aside",
                },
                [
                  e("div", { staticClass: "logo" }, [
                    e("img", { attrs: { src: s(3086), alt: "" } }),
                  ]),
                  e(
                    "k-menu",
                    {
                      attrs: {
                        "default-active": t.$route.path,
                        "active-color": "#752bec",
                        "active-shape": ["line"],
                        "text-color": "#061e26",
                        "background-color": "#00000017",
                        mode: "column",
                        tips: !0,
                        router: "",
                      },
                    },
                    t._l(t.menus, function (t, s) {
                      return e(
                        "k-menu-item",
                        {
                          key: s,
                          attrs: {
                            index: t.indexPath,
                            title: t.content,
                            width: "60",
                            height: "60",
                          },
                        },
                        [e("i", { class: t.icon })]
                      );
                    }),
                    1
                  ),
                  e("div", { staticClass: "empty" }),
                  e(
                    "el-tooltip",
                    {
                      attrs: {
                        effect: "dark",
                        content: "退出登录",
                        placement: "right",
                      },
                    },
                    [
                      e("div", { staticClass: "quit" }, [
                        e("i", {
                          staticClass: "el-icon-switch-button",
                          attrs: { slot: "reference" },
                          on: { click: t.quitFn },
                          slot: "reference",
                        }),
                      ]),
                    ]
                  ),
                ],
                1
              ),
            ],
            1
          );
        },
        r = [],
        l = s(2197),
        c = s(4066),
        u = s(3850),
        d = s(493),
        h = {
          name: "k-aside",
          components: { kMenuItem: u.A, kMenu: d.A, kAside: c.A },
          data() {
            return {
              visible: !1,
              isShowDialog: !1,
              dialogData: { title: "提示", message: "确认退出登录？" },
              menus: [
                {
                  icon: "el-icon-pie-chart",
                  content: "数据中心",
                  indexPath: "/dataCenter",
                },
                {
                  icon: "el-icon-printer",
                  content: "实例管理",
                  indexPath: "/bots",
                },
                {
                  icon: "el-icon-files",
                  content: "模块管理",
                  indexPath: "/modules",
                },
                {
                  icon: "el-icon-shopping-bag-1",
                  content: "模块中心",
                  indexPath: "/modulesCenter",
                },
                {
                  icon: "el-icon-set-up",
                  content: "指令管理",
                  indexPath: "/command",
                },
                {
                  icon: "el-icon-setting",
                  content: "配置查看",
                  indexPath: "/config",
                },
                {
                  icon: "el-icon-cpu",
                  content: "控制台",
                  indexPath: "/console",
                },
              ],
            };
          },
          methods: {
            ...(0, o.mapMutations)("layoutOption", ["updateToken"]),
            cancelFn() {
              this.isShowDialog = !1;
            },
            quitFn() {
              this.$confirm(this.dialogData.message, this.dialogData.title, {
                confirmButtonText: "确定",
                cancelButtonText: "取消",
                type: "warning",
              })
                .then(() => {
                  (0, l.jd)();
                })
                .then(() => {
                  this.updateToken(""), this.$router.push("/login");
                })
                .catch(() => {
                  this.cancelFn();
                });
            },
          },
          mounted() {},
        },
        p = h,
        m = s(8529),
        v = (0, m.A)(p, a, r, !1, null, "e1810e9c", null),
        f = v.exports,
        g = function () {
          var t = this,
            e = t._self._c;
          return e(
            "el-footer",
            { attrs: { height: "30px" } },
            [
              e(
                "pps-context-menu",
                { attrs: { menus: t.menus, position: "top" } },
                [
                  e(
                    "div",
                    {
                      staticClass: "version detail",
                      attrs: { slot: "content" },
                      slot: "content",
                    },
                    [
                      e("div", { staticClass: "kotori" }, [
                        t._v("kotori v" + t._s(t.status.core)),
                      ]),
                    ]
                  ),
                ]
              ),
              e(
                "pps-context-menu",
                {
                  attrs: {
                    menus: [
                      { label: "内存", rate: t.roundedRam.rate },
                      { label: "CPU", rate: t.roundedCpu.rate },
                    ],
                    position: "top",
                  },
                  scopedSlots: t._u([
                    {
                      key: "item",
                      fn: function ({ scope: s }) {
                        return [
                          e(
                            "div",
                            { staticClass: "rate" },
                            [
                              e("span", [t._v(t._s(s.label))]),
                              e("el-progress", {
                                attrs: { percentage: Number(s.rate) },
                              }),
                            ],
                            1
                          ),
                        ];
                      },
                    },
                  ]),
                },
                [
                  e(
                    "div",
                    {
                      staticClass: "status detail",
                      attrs: { slot: "content" },
                      slot: "content",
                    },
                    [
                      e("span", [
                        t._v(
                          "内存:" + t._s(t.fixedFn(t.roundedRam.rate)) + " %"
                        ),
                      ]),
                      t._v("   "),
                      e("span", [
                        t._v(
                          "CPU:" + t._s(t.fixedFn(t.roundedCpu.rate)) + " %"
                        ),
                      ]),
                    ]
                  ),
                ]
              ),
            ],
            1
          );
        },
        k = [],
        b = {
          name: "k-footer",
          data() {
            return { status: "" };
          },
          methods: {
            ...(0, o.mapMutations)("webSocketOption", [
              "updateCpu",
              "updateRam",
            ]),
            contextMenuFn() {},
            fixedFn(t) {
              return Number(t).toFixed(1);
            },
          },
          computed: {
            ...(0, o.mapGetters)("webSocketOption", [
              "roundedRam",
              "roundedCpu",
            ]),
            menus() {
              return [
                { label: `主程序版本: v${this.status.main}` },
                { label: `核心版本: v${this.status.core}` },
                { label: `加载器版本: v${this.status.loader}` },
              ];
            },
          },
          mounted() {
            this.$ws.bus.$on("wsMessage", (t) => {
              "stats" === t.type &&
                (this.updateCpu(t.data.cpu), this.updateRam(t.data.ram));
            }),
              (0, l.P8)().then(({ data: t }) => {
                this.status = t;
              });
          },
          beforeDestroy() {
            this.$ws.bus.$off("wsMessage");
          },
        },
        F = b,
        C = (0, m.A)(F, g, k, !1, null, "7115f3ec", null),
        x = C.exports,
        w = function () {
          var t = this,
            e = t._self._c;
          return e("el-header", [
            e(
              "span",
              { staticClass: "header-left" },
              [
                e(
                  "pps-button",
                  {
                    nativeOn: {
                      click: function (e) {
                        return t.onFold();
                      },
                    },
                  },
                  [e("i", { class: t.arrowClass })]
                ),
                e(
                  "pps-button",
                  {
                    on: {
                      click: function (e) {
                        return t.toggleFullscreen();
                      },
                    },
                  },
                  [e("i", { staticClass: "el-icon-full-screen" })]
                ),
              ],
              1
            ),
            e("span", { staticClass: "title header-center" }, [
              t._v(t._s(t.pathTitle)),
            ]),
            e(
              "span",
              { staticClass: "header-right" },
              [
                e("pps-icon", {
                  attrs: { icon: "pps-icon-github" },
                  on: { click: t.linkGithubFn },
                }),
                e("pps-icon", {
                  attrs: { icon: "pps-icon-qq" },
                  on: { click: t.linkQQFn },
                }),
                e("pps-icon", {
                  attrs: { icon: "pps-icon-help" },
                  on: { click: t.linkDocsFn },
                }),
              ],
              1
            ),
          ]);
        },
        $ = [];
      const y = {
        methods: {
          toggleFullscreen() {
            this.isFullscreen()
              ? this.exit()
              : this.enter(document.documentElement);
          },
          isFullscreen() {
            return (
              !!document.fullscreenElement ||
              !!document.webkitFullscreenElement ||
              !!document.mozFullScreenElement ||
              !!document.msFullscreenElement ||
              null
            );
          },
          enter(t) {
            t.requestFullscreen
              ? t.requestFullscreen()
              : t.webkitRequestFullscreen
              ? t.webkitRequestFullscreen()
              : t.mozRequestFullScreen
              ? t.mozRequestFullScreen()
              : t.msRequestFullscreen && t.msRequestFullscreen();
          },
          exit() {
            document.exitFullscreen
              ? document.exitFullscreen()
              : document.webkitExitFullscreen
              ? document.webkitExitFullscreen()
              : document.mozCancelFullScreen
              ? document.mozCancelFullScreen()
              : document.msExitFullscreen && document.msExitFullscreen();
          },
        },
      };
      var S = {
          name: "kHeader",
          methods: {
            onFold() {
              this.$store.commit(
                "layoutOption/updateIsFoldAside",
                !this.$store.state.layoutOption.isFoldAside
              );
            },
            clearvuexFn() {
              localStorage.removeItem("vuex");
            },
            linkGithubFn() {
              window.open("https://github.com/kotorijs", "_blank");
            },
            linkQQFn() {
              window.open("https://qm.qq.com/q/Nb3lQPt7We", "_blank");
            },
            linkDocsFn() {
              window.open("https://kotori.js.org/", "_blank");
            },
          },
          computed: {
            ...(0, o.mapGetters)("layoutOption", ["getIsFoldAside"]),
            pathTitle() {
              return this.$route.matched[1].meta.title;
            },
            isPadding() {
              return "/console" === this.$route.fullPath;
            },
            arrowClass() {
              return this.getIsFoldAside
                ? "el-icon-d-arrow-right"
                : "el-icon-d-arrow-left";
            },
          },
          mixins: [y],
        },
        _ = S,
        A = (0, m.A)(_, w, $, !1, null, null, null),
        P = A.exports,
        q = { rE: "1.4.0" };
      const R = ["/console", "/sandBox"];
      var I = {
          name: "myLayout",
          components: { kAside: f, kFooter: x, kHeader: P },
          data() {
            return { isSmall: !1 };
          },
          methods: {
            handleAside() {
              R.includes(this.$route.fullPath) || this.isSmall
                ? this.$store.commit("layoutOption/updateIsFoldAside", !0)
                : this.$store.commit("layoutOption/updateIsFoldAside", !1);
            },
            resizeFn(t, e) {
              Math.floor(t) <= 428 ? (this.isSmall = !0) : (this.isSmall = !1);
            },
            async isVersionLatest() {
              return new Promise((t, e) => {
                (0, l.nI)().then(({ data: s }) => {
                  // s["@kotori-bot/kotori-plugin-webui"] !== `^${q.rE}`
                  //   ? (this.$message.error("当前版本过低，请更新webui插件"),
                  //     this.$route.path.includes("/login") ||
                  //       (this.$store.commit("layoutOption/updateToken"),
                  //       this.$router.push("/login")),
                  //     e(new Error("版本过低")))
                  //   : t();
                  t();
                });
              });
            },
          },
          mounted() {
            this.isVersionLatest()
              .then(() => {
                this.handleAside(),
                  this.$ws.init(),
                  this.$store.dispatch("command/getCommands"),
                  this.$store.dispatch("modulesDetail/getData");
              })
              .catch(() => {});
          },
          beforeDestroy() {
            console.log("layout beforeDestroy"),
              this.$ws.instance && this.$ws.close();
          },
          updated() {
            this.isVersionLatest()
              .then(() => {
                this.handleAside();
              })
              .catch(() => {});
          },
          computed: {
            ...(0, o.mapGetters)("layoutOption", ["getIsFoldAside"]),
            isPadding() {
              return !!R.includes(this.$route.fullPath);
            },
            isFooter() {
              return !R[0].includes(this.$route.fullPath);
            },
          },
        },
        D = I,
        O = (0, m.A)(D, i, n, !1, null, "09834a14", null),
        E = O.exports;
    },
    3086: function (t, e, s) {
      t.exports = s.p + "img/favicon.b107f5c1.svg";
    },
  },
]);
//# sourceMappingURL=859.740917f5.js.map
