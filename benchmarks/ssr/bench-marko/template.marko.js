// Compiled using marko@5.37.63 - DO NOT EDIT
import { t as _t } from "marko/src/runtime/html/index.js";
const _marko_componentType = "template.marko",
  _marko_template = _t(_marko_componentType);
_marko_template.path = __filename;
export default _marko_template;
import { x as _marko_escapeXml } from "marko/src/runtime/html/helpers/escape-xml.js";
import _of_fallback from "marko/src/runtime/helpers/of-fallback.js";
import _marko_renderer from "marko/src/runtime/components/renderer.js";
const _marko_component = {};
_marko_template._ = _marko_renderer(function (input, out, _componentDef, _component, state, $global) {
  out.w("<div id=app>");
  out.w("<p>");
  out.w("Server time: ");
  out.w(_marko_escapeXml(input.time));
  out.w("</p>");
  out.w("<p>");
  out.w("Items: ");
  out.w(_marko_escapeXml(input.items.length));
  out.w("</p>");
  out.w("<ul>");
  {
    let _keyValue = 0;
    for (const item of _of_fallback(input.items)) {
      const _keyScope = `[${_keyValue++}]`;
      out.w("<li>");
      out.w(_marko_escapeXml(item));
      out.w("</li>");
    }
  }
  out.w("</ul>");
  out.w("</div>");
}, {
  t: _marko_componentType,
  i: true,
  d: true
}, _marko_component);
_marko_template.meta = {
  id: _marko_componentType
};