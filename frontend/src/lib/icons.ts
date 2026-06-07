import { defineComponent, h } from "vue";

function icon(svgContent: string) {
  return defineComponent({
    inheritAttrs: false,
    setup(_, { attrs }) {
      return () =>
        h("svg", {
          viewBox: "0 0 24 24",
          fill: "none",
          stroke: "currentColor",
          "stroke-width": "2",
          "stroke-linecap": "round",
          "stroke-linejoin": "round",
          ...attrs,
          innerHTML: svgContent,
        });
    },
  });
}

export const Bell = icon(
  '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
);
export const ChevronDown = icon('<polyline points="6 9 12 15 18 9"/>');
export const ChevronUp = icon('<polyline points="18 15 12 9 6 15"/>');
export const Search = icon(
  '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
);
export const Bookmark = icon(
  '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>',
);
export const SlidersHorizontal = icon(
  '<line x1="21" y1="4" x2="14" y2="4"/><line x1="10" y1="4" x2="3" y2="4"/><line x1="21" y1="12" x2="12" y2="12"/><line x1="8" y1="12" x2="3" y2="12"/><line x1="21" y1="20" x2="16" y2="20"/><line x1="12" y1="20" x2="3" y2="20"/><circle cx="12" cy="4" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="20" r="2"/>',
);
export const BarChart3 = icon(
  '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>',
);
export const BriefcaseBusiness = icon(
  '<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><path d="M8 21v-4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4"/>',
);
export const CheckCircle2 = icon(
  '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
);
export const FilePlus2 = icon(
  '<path d="M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4"/><polyline points="14 2 14 8 20 8"/><path d="M3 15h6"/><path d="M6 12v6"/>',
);
export const UserCheck = icon(
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/>',
);
export const UserPlus = icon(
  '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>',
);
export const Users = icon(
  '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
);
