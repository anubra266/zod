import { metadataImage } from "@/loaders/metadata";
import { source } from "@/loaders/source";
import { Callout } from "fumadocs-ui/components/callout";
import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { notFound } from "next/navigation";
import { Tabs } from "@/components/tabs";

export const revalidate = 86400;

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = page.data.title;
  const description = page.data.description;

  const MDXContent = page.data.body;
  const toc = page.data.toc
    .filter((item) => item.depth <= 3)
    .map((item) => {
      return item;
    });

  return (
    <DocsPage toc={toc} tableOfContent={{ style: "clerk", single: false }} full={false}>
      {title && title !== "Intro" ? <DocsTitle>{title}</DocsTitle> : null}
      <DocsDescription>{description}</DocsDescription>
      <DocsBody {...{}}>
        <MDXContent
          components={{
            ...defaultMdxComponents,
            // this allows you to link to other pages with relative file paths
            a: createRelativeLink(source, page),
            // you can add other MDX components here
            blockquote: Callout,
            Tabs,
          }}
        />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const title = (page.data.title ?? "Home") + " | Zod Docs";
  const description = page.data.description;
  return metadataImage.withImage(page.slugs, {
    title,
    description,
    openGraph: {
      type: "website",
      title,
      description,
      siteName: "Zod",
      url: `https://zod.dev/${page.slugs.join("/")}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description ?? "")}&path=${encodeURIComponent(`zod.dev/${page.slugs.join("/")}`)}`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      creator: "@colinhacks",
      site: "@colinhacks",
    },
    keywords: ["zod", "typescript", "validation", "schema"],
  });
}
