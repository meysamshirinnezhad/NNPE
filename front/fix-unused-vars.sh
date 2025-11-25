#!/bin/bash

# Fix unused imports in study.service.ts
sed -i '/^import.*Module.*from/d' front/src/api/services/study.service.ts

# Fix Logo.tsx
sed -i '/const sizeClasses = {/,/};/d' front/src/components/base/Logo.tsx

# Fix achievements page (Button import)
sed -i "/import Button from/d" front/src/pages/achievements/page.tsx

# Fix admin analytics page
sed -i "s/const \[selectedMetric, setSelectedMetric\] = useState('users');/\/\/ const [selectedMetric, setSelectedMetric] = useState('users');/" front/src/pages/admin/analytics/page.tsx
sed -i "s/{mockAnalytics.userGrowth.map((data, index) =>/{mockAnalytics.userGrowth.map((data) =>/" front/src/pages/admin/analytics/page.tsx

# Fix admin questions page
sed -i "/import LoadingSpinner from/d" front/src/pages/admin/questions/page.tsx

# Fix analytics page
sed -i "s/const \[analyticsData, setAnalyticsData\]/const [, setAnalyticsData]/" front/src/pages/analytics/page.tsx

# Fix bookmarks page
sed -i "/const getAccuracyColor/,/};/d" front/src/pages/bookmarks/page.tsx
sed -i "/const getMasteryLabel/,/};/d" front/src/pages/bookmarks/page.tsx  
sed -i "/const topicsMap = bookmarks.reduce/,/}, {});/d" front/src/pages/bookmarks/page.tsx

# Fix forgot-password page
sed -i "s/import { updateSEO, seoData }/import { updateSEO }/" front/src/pages/forgot-password/page.tsx

# Fix forum post page
sed -i "s/const { postId } = useParams();/const { } = useParams();/" front/src/pages/forum/post/page.tsx

# Fix practice question page  
sed -i "/const correctOption = question.options.find/d" front/src/pages/practice/question/page.tsx

# Fix subscription page
sed -i "s/const \[subscription, setSubscription\]/const [, setSubscription]/" front/src/pages/settings/subscription/page.tsx

# Fix study groups detail page
sed -i "s/const { groupId } = useParams();/const { } = useParams();/" front/src/pages/study-groups/detail/page.tsx

# Fix study-path page
sed -i "/^import.*Module.*from/s/Module, //" front/src/pages/study-path/page.tsx
sed -i "/const getModuleIcon/,/};/d" front/src/pages/study-path/page.tsx
sed -i "/const getModuleColor/,/};/d" front/src/pages/study-path/page.tsx
sed -i "/const currentWeekData = studyPlan/d" front/src/pages/study-path/page.tsx
sed -i "s/{weekModules.map((module, index) =>/{weekModules.map((module) =>/" front/src/pages/study-path/page.tsx

# Fix test results page
sed -i "s/const \[error, setError\]/const [, setError]/" front/src/pages/test/results/page.tsx

# Fix test review page
sed -i "s/const \[apiTest, setApiTest\]/const [, setApiTest]/" front/src/pages/test/review/page.tsx

# Fix topics page
sed -i "/const getMasteryColor/,/};/d" front/src/pages/topics/page.tsx
sed -i "/const getMasteryLabel/,/};/d" front/src/pages/topics/page.tsx
sed -i "s/{topics.slice(0, 3).map((topic, index) =>/{topics.slice(0, 3).map((topic) =>/" front/src/pages/topics/page.tsx

echo "✓ Fixed all unused variables and imports"
