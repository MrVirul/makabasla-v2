type MediaItem = {
    url: string;
    type: "image" | "video";
};

type Project = {
    title: string;
    description: string;
    thumbnail: string;
    media: MediaItem[];
};

export const projects: Project[] = [
    {
        title: 'Daihatsu Rocky Full restoration',
        description: 'wefwf',
        thumbnail: 'https://res.cloudinary.com/dreomksm2/image/upload/v1777372238/v4cxiocps8jgmimsuegc.jpg',
        media: [
            {
                url: 'https://res.cloudinary.com/dreomksm2/image/upload/v1777372237/hbdvadz6zht1duhk3pez.jpg',
                type: "image"
            },
            {
                url: 'https://res.cloudinary.com/dreomksm2/video/upload/v1777372246/d1szr0n3sonchfkenb9z.mp4',
                type: "video"
            },

        ]
    }
]