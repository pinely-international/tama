const config = {
  title: "TamaJs",
  tagline: "Reactive UI Rendering without Roots",
  favicon: "img/logo.svg",

  // Set the production url of your site here
  url: "https://tama.denshya.dev/",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "denshya", // Usually your GitHub org/user name.
  projectName: "tama", // Usually your repo name.

  themeConfig: {
    // Replace with your project's social card
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "Tama",
      logo: {
        alt: "Tama Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "learn",
          position: "left",
          label: "Learn",
        },
        // {
        //   type: "docSidebar",
        //   sidebarId: "learn",
        //   position: "left",
        //   label: "Usage",
        // },
        {
          type: "docSidebar",
          sidebarId: "demos",
          position: "left",
          label: "Demos",
        },
        {
          type: "doc",
          docId: "specification",
          position: "left",
          label: "Specification",
        },
        {
          type: "doc",
          docId: "benchmarks",
          position: "left",
          label: "Benchmarks",
        },
        {
          href: "https://github.com/denshya/proton",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Docs",
          items: [
            {
              label: "Getting Started",
              to: "/learn",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "Discord",
              href: "https://discordapp.com/invite/sHp2pxrSws",
            },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/denshya/proton",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Denshya Community Movement. Started within Pinely International. Built with Docusaurus.`,
    }
  }
}

export default config
