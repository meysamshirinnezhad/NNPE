
import { useEffect } from 'react';
import { updateSEO, seoData } from '../../utils/seo';

export default function Home() {
  useEffect(() => {
    updateSEO(seoData.home);
  }, []);

  return (
    // This is the template home page, please edit from this page
    <div className="flex flex-col items-center pt-8">
      <h1 className="text-xl font-bold">Please switch pages in the dropdown menu above 👆🏻</h1>
    </div>
  );
}
