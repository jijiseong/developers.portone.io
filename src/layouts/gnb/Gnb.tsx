import { A } from "@solidjs/router";
import clsx from "clsx";
import { createMemo, For, Show, untrack } from "solid-js";

import type { DocsEntry } from "~/content/config";
import { useSidebarContext } from "~/layouts/sidebar/context";
import { useSystemVersion } from "~/state/system-version";
import type { Lang, SystemVersion } from "~/type";

import { SearchButton } from "../sidebar/search";
import Dropdown, { type DropdownItem } from "./Dropdown";
import Logo from "./Logo";
import MobileMenuButton from "./MobileMenuButton";
import { VersionSwitch } from "./VersionSwitch";

interface Props {
  lang: Lang;
  navAsMenu: boolean;
  docData?: DocsEntry;
}

const ko = {
  developers: "개발자센터",
  "sdk-playground": "SDK 놀이터",
  console: "관리자 콘솔",
  language: "언어",
};
const en: typeof ko = {
  developers: "Developers",
  "sdk-playground": "SDK Playground",
  console: "Admin Console",
  language: "Language",
};

type Nav = {
  link?: string | Record<SystemVersion, string>;
  label: string;
  dropdownItems?: DropdownItem[];
};

export default function Gnb(props: Props) {
  const t = createMemo(() => (props.lang === "ko" ? ko : en));
  const { systemVersion } = useSystemVersion();
  const serverSystemVersion = untrack(systemVersion);
  const sidebarContext = useSidebarContext();

  const subNavs: Nav[] = [
    {
      link: "/opi/ko",
      label: "원 페이먼트 인프라",
      dropdownItems: [
        {
          label: "퀵 가이드",
        },
        {
          label: "연동하기",
        },
        {
          label: "부가기능",
        },
      ],
    },
    {
      link: "/platform",
      label: "파트너 정산 자동화",
      dropdownItems: [
        {
          label: "서비스 가이드",
        },
        {
          label: "사용 예시",
        },
      ],
    },
    {
      label: "API & SDK",
      link: { v1: "/api/rest-v1", v2: "/api/rest-v2" },
      dropdownItems: [
        {
          label: "REST API V1",
          link: "/api/rest-v1",
          systemVersion: "v1",
        },
        {
          label: "REST API V2",
          link: "/api/rest-v2",
          systemVersion: "v2",
        },
        {
          label: "Client SDKs",
          link: {
            v1: "/sdk/ko/v1-mobile-sdk/readme",
            v2: "/sdk/ko/v2-mobile-sdk/readme",
          },
        },
        {
          label: "Server SDKs",
          link: "/sdk/ko/v2-server-sdk/readme",
        },
        {
          label: t()["sdk-playground"],
          link: "https://sdk-playground.portone.io/",
        },
      ],
    },
  ];

  const topNavs = [
    {
      label: "릴리즈 노트",
      link: "/release-notes",
    },
    {
      label: "기술 블로그",
      link: "/blog",
    },
    {
      label: t()["console"],
      link: "https://admin.portone.io/",
    },
  ];

  return (
    <>
      <style>
        {`
        [data-selected-system-version="v1"] [data-system-version="v2"],
        [data-selected-system-version="v2"] [data-system-version="v1"] {
          display: none;
        }
        `}
      </style>
      <div class="h-14 md:h-26">
        <div class="fixed h-inherit w-full bg-white z-gnb">
          <header
            data-selected-system-version={systemVersion()}
            class="mx-auto h-inherit max-w-8xl w-full flex flex-col px-10"
          >
            <div class="grid grid-cols-2 h-14 items-center gap-6 border-b bg-white z-gnb-body md:grid-cols-[auto_1fr_auto]">
              <A
                class="h-full inline-flex items-center"
                href={`/opi/${props.lang}`}
              >
                <div class="flex items-center gap-2">
                  <Logo class="w-22" />
                  <span class="break-keep">{t()["developers"]}</span>
                </div>
              </A>
              <div class="hidden justify-center md:flex">
                <SearchButton lang={props.lang} />
              </div>
              <div class="hidden h-full items-center md:flex">
                <For each={topNavs}>
                  {(nav) => (
                    <Dropdown
                      serverSystemVersion={serverSystemVersion}
                      link={nav.link}
                    >
                      <span class="p-2">{nav.label}</span>
                    </Dropdown>
                  )}
                </For>
              </div>
              <MobileMenuButton />
            </div>
            <div class="hidden h-12 items-center gap-5 border-b bg-white z-gnb-body md:flex">
              <div class="h-full items-center">
                <For each={subNavs}>
                  {(nav) => (
                    <Dropdown
                      serverSystemVersion={serverSystemVersion}
                      link={nav.link}
                      items={nav.dropdownItems}
                    >
                      <span class="p-2">{nav.label}</span>
                    </Dropdown>
                  )}
                </For>
              </div>
              <VersionSwitch docData={props.docData} />
            </div>
            <Show when={props.navAsMenu}>
              {(_) => {
                const navs = createMemo<Nav[]>(() => [
                  ...subNavs,
                  {
                    label: "리소스",
                    dropdownItems: topNavs.map((nav) => ({
                      label: nav.label,
                      link: nav.link,
                    })),
                  },
                ]);
                return (
                  <div
                    class={clsx(
                      "flex gap-6 absolute inset-x-0 bottom-0 px-12 py-6 rounded-b-md transition-transform transform duration-300 flex-col items-start bg-white md:hidden",
                      sidebarContext.get() && "translate-y-full shadow-lg",
                    )}
                  >
                    <For each={navs()}>
                      {(nav) => (
                        <Dropdown
                          serverSystemVersion={serverSystemVersion}
                          link={nav.link}
                          items={nav.dropdownItems}
                        >
                          <span>{nav.label}</span>
                        </Dropdown>
                      )}
                    </For>
                    <VersionSwitch docData={props.docData} />
                  </div>
                );
              }}
            </Show>
          </header>
        </div>
      </div>
    </>
  );
}
