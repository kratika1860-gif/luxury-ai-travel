"use client";
import { useState, useEffect } from "react";

export default function WikipediaImage({ place, className }: { place: string; className?: string }) {
  const [imgUrl, setImgUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const query = encodeURIComponent(place);
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&prop=pageimages&generator=search&gsrsearch=${query}&gsrlimit=1&pithumbsize=800&origin=*`);
        const data = await res.json();
        const pages = data?.query?.pages;
        if (pages) {
          const firstPage = Object.values(pages)[0] as any;
          if (firstPage?.thumbnail?.source) {
            setImgUrl(firstPage.thumbnail.source);
            return;
          }
        }
        setImgUrl(`https://loremflickr.com/800/600/${query}`);
      } catch (e) {
        setImgUrl(`https://loremflickr.com/800/600/${encodeURIComponent(place)}`);
      }
    };
    fetchImage();
  }, [place]);

  if (!imgUrl) return <div className={`bg-gray-200/50 animate-pulse ${className}`} />;
  return <img src={imgUrl} alt={place} loading="lazy" className={className} />;
}
