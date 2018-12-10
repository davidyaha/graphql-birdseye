import joint from "jointjs/index";
var _ = require("lodash");

joint.shapes.basic.Generic.define(
  "devs.Model",
  {
    inPorts: [],
    outPorts: [],
    size: {
      width: 300,
      height: "auto"
    },
    attrs: {
      ".": {
        magnet: false
      },
      ".label": {
        text: "Model",
        "ref-x": 0.5,
        "ref-y": 10,
        "font-size": 18,
        "text-anchor": "middle",
        fill: "white"
      },
      ".header": {
        "ref-width": "100%",
        height: 36.5,
        fill: "#548f9e",
        stroke: "#548f9e"
      },
      ".body": {
        "ref-width": "100%",
        "ref-height": "100%",
        y: 36.5,
        stroke: "#548f9e"
      },
      ".joint-port": {
        y: 36.5
      }
    },
    ports: {
      groups: {
        in: {
          position: {
            name: "left",
            args: {
              dy: 36.5
            }
          },
          attrs: {
            ".port-label": {
              fill: "#000"
            },
            ".port-body": {
              fill: "#fff",
              stroke: "#548f9e",
              height: 40,
              y: -20,
              magnet: false
            }
          },
          label: {
            position: {
              name: "right",
              args: {
                y: 0
              }
            }
          }
        },
        out: {
          position: {
            name: "right",
            args: {
              dy: 36.5
            }
          },
          attrs: {
            ".port-label": {
              fill: "#000"
            },
            ".port-body": {
              fill: "#fff",
              stroke: "#000",
              magnet: false
            }
          },
          label: {
            position: {
              name: "left",
              args: {
                y: 0
              }
            }
          }
        }
      }
    }
  },
  {
    markup:
      '<g class="rotatable"><rect class="header"/><rect class="body"/><text class="label"/></g>',
    portMarkup: '<rect class="port-body"/>',
    portLabelMarkup: '<text class="port-label"/>',

    initialize: function() {
      joint.shapes.basic.Generic.prototype.initialize.apply(this, arguments);

      this.on("change:inPorts change:outPorts", this.updatePortItems, this);
      this.updatePortItems();
    },

    updatePortItems: function(_model: any, _changed: any, opt: any) {
      // Make sure all ports are unique.
      var inPorts = joint.util.uniq(this.get("inPorts"));
      var outPorts = joint.util.difference(
        joint.util.uniq(this.get("outPorts")),
        inPorts
      );

      var inPortItems = this.createPortItems("in", inPorts);
      var outPortItems = this.createPortItems("out", outPorts);
      this.prop(
        "ports/items",
        inPortItems.concat(outPortItems),
        joint.util.assign({ rewrite: true }, opt)
      );
      var portCount = Math.max(inPorts.length, outPorts.length);
      this._setSize(portCount);
    },
    _setSize: function(portCount: number) {
      const size = this.get("size");
      const height = portCount * 40;
      if (!size.height || size.height === "auto") {
        this.set("size", {
          ...size,
          height
        });
      }
    },
    createPortItem: function(group: any, port: any) {
      return {
        id: typeof port === "object" ? port.id : port,
        group: group,
        attrs: {
          ".port-label": {
            text: typeof port === "object" ? port.label : port
          },
          ".port-body": {
            width: group === "in" ? this.get("size").width : 0
          }
        }
      };
    },

    createPortItems: function(group: any, ports: any) {
      return joint.util
        .toArray(ports)
        .map(this.createPortItem.bind(this, group));
    },

    _addGroupPort: function(port: any, group: any, opt: any) {
      var ports = this.get(group);
      return this.set(
        group,
        Array.isArray(ports) ? ports.concat(port) : [port],
        opt
      );
    },

    addOutPort: function(port: any, opt: any) {
      return this._addGroupPort(port, "outPorts", opt);
    },

    addInPort: function(port: any, opt: any) {
      return this._addGroupPort(port, "inPorts", opt);
    },

    _removeGroupPort: function(port: any, group: any, opt: any) {
      return this.set(group, joint.util.without(this.get(group), port), opt);
    },

    removeOutPort: function(port: any, opt: any) {
      return this._removeGroupPort(port, "outPorts", opt);
    },

    removeInPort: function(port: any, opt: any) {
      return this._removeGroupPort(port, "inPorts", opt);
    },

    _changeGroup: function(group: any, properties: any, opt: any) {
      return this.prop(
        "ports/groups/" + group,
        joint.util.isObject(properties) ? properties : {},
        opt
      );
    },

    changeInGroup: function(properties: any, opt: any) {
      return this._changeGroup("in", properties, opt);
    },

    changeOutGroup: function(properties: any, opt: any) {
      return this._changeGroup("out", properties, opt);
    }
  }
);

joint.shapes.devs.Model.define("devs.Atomic", {
  size: {
    width: 80,
    height: 80
  },
  attrs: {
    ".label": {
      text: "Atomic"
    }
  }
});

joint.shapes.devs.Model.define("devs.Coupled", {
  size: {
    width: 200,
    height: 300
  },
  attrs: {
    ".label": {
      text: "Coupled"
    }
  }
});

joint.dia.Link.define(
  "devs.Link",
  {
    attrs: {
      line: {
        connection: true,
        stroke: "#38616b",
        fill: "transparent",
        strokeWidth: 2,
        // strokeLinejoin: "round",
        targetMarker: {
          type: "path",
          d: "M 10 -5 0 0 10 5 z"
        }
      },
      wrapper: {
        connection: true,
        strokeWidth: 2,
        strokeLinejoin: "round"
      }
    }
  },
  {
    markup: [
      {
        tagName: "path",
        selector: "wrapper",
        attributes: {
          fill: "none",
          cursor: "pointer",
          stroke: "transparent"
        }
      },
      {
        tagName: "path",
        selector: "line",
        attributes: {
          fill: "none",
          "pointer-events": "none"
        }
      }
    ]
  }
);

export default joint;

export function adjustVertices(graph: any, cell: any) {
  // if `cell` is a view, find its model
  cell = cell.model || cell;

  if (cell instanceof joint.dia.Element) {
    // `cell` is an element

    _.chain(graph.getConnectedLinks(cell))
      .groupBy(function(link: any) {
        // the key of the group is the model id of the link's source or target
        // cell id is omitted
        return _.omit([link.source().id, link.target().id], cell.id)[0];
      })
      .each(function(group: any, key: any) {
        // if the member of the group has both source and target model
        // then adjust vertices
        if (key !== "undefined") adjustVertices(graph, _.first(group));
      })
      .value();

    return;
  }

  // `cell` is a link
  // get its source and target model IDs
  var sourceId = cell.get("source").id || cell.previous("source").id;
  var targetId = cell.get("target").id || cell.previous("target").id;

  // if one of the ends is not a model
  // (if the link is pinned to paper at a point)
  // the link is interpreted as having no siblings
  if (!sourceId || !targetId) return;

  // identify link siblings
  var siblings = _.filter(graph.getLinks(), function(sibling: any) {
    var siblingSourceId = sibling.source().id;
    var siblingTargetId = sibling.target().id;

    // if source and target are the same
    // or if source and target are reversed
    return (
      (siblingSourceId === sourceId && siblingTargetId === targetId) ||
      (siblingSourceId === targetId && siblingTargetId === sourceId)
    );
  });

  var numSiblings = siblings.length;
  switch (numSiblings) {
    case 0: {
      // the link has no siblings
      break;
    }
    case 1: {
      // there is only one link
      // no vertices needed
      cell.unset("vertices");
      break;
    }
    default: {
      // there are multiple siblings
      // we need to create vertices

      // find the middle point of the link
      var sourceCenter = graph
        .getCell(sourceId)
        .getBBox()
        .center();
      var targetCenter = graph
        .getCell(targetId)
        .getBBox()
        .center();
      var midPoint = joint.g.Line(sourceCenter, targetCenter).midpoint();

      // find the angle of the link
      var theta = sourceCenter.theta(targetCenter);

      // constant
      // the maximum distance between two sibling links
      var GAP = 20;

      _.each(siblings, function(sibling: any, index: any) {
        // we want offset values to be calculated as 0, 20, 20, 40, 40, 60, 60 ...
        var offset = GAP * Math.ceil(index / 2);

        // place the vertices at points which are `offset` pixels perpendicularly away
        // from the first link
        //
        // as index goes up, alternate left and right
        //
        //  ^  odd indices
        //  |
        //  |---->  index 0 sibling - centerline (between source and target centers)
        //  |
        //  v  even indices
        var sign = index % 2 ? 1 : -1;

        // to assure symmetry, if there is an even number of siblings
        // shift all vertices leftward perpendicularly away from the centerline
        if (numSiblings % 2 === 0) {
          offset -= (GAP / 2) * sign;
        }

        // make reverse links count the same as non-reverse
        var reverse = theta < 180 ? 1 : -1;

        // we found the vertex
        var angle = joint.g.toRad(theta + sign * reverse * 90);
        var vertex = joint.g.Point.fromPolar(offset, angle, midPoint);

        // replace vertices array with `vertex`
        sibling.vertices([vertex]);
      });
    }
  }
}

export function addTools(paper: any, link: any) {
  var toolsView = new joint.dia.ToolsView({
    tools: [
      new joint.linkTools.SourceArrowhead(),
      new joint.linkTools.TargetArrowhead()
    ]
  });
  link.findView(paper).addTools(toolsView);
}

export function bindInteractionEvents(
  adjustVertices: any,
  graph: any,
  paper: any
) {
  // bind `graph` to the `adjustVertices` function
  var adjustGraphVertices = _.partial(adjustVertices, graph);

  // adjust vertices when a cell is removed or its source/target was changed
  graph.on("add remove change:source change:target", adjustGraphVertices);

  // adjust vertices when the user stops interacting with an element
  paper.on("cell:pointerup", adjustGraphVertices);
}

export function bindToolEvents(paper: any) {
  // show link tools
  paper.on("link:mouseover", function(linkView: any) {
    linkView.showTools();
  });

  // hide link tools
  paper.on("link:mouseout", function(linkView: any) {
    linkView.hideTools();
  });
  paper.on("blank:mouseover cell:mouseover", function() {
    paper.hideTools();
  });
}
