import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { mockBlogPosts } from '@/data/mockData';

const getCategoryLabel = (category: string) => {
  switch(category) {
    case 'rituals': return 'Ритуалы';
    case 'health': return 'Здоровье';
    case 'diy': return 'Своими руками';
    case 'history': return 'История';
    default: return category;
  }
};

const getCategoryColor = (category: string) => {
  switch(category) {
    case 'rituals': return 'bg-purple-100 text-purple-800';
    case 'health': return 'bg-green-100 text-green-800';
    case 'diy': return 'bg-orange-100 text-orange-800';
    case 'history': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const BlogPage = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <h1 className="text-4xl md:text-5xl font-serif font-bold text-center mb-4">Банная энциклопедия</h1>
      <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
        Статьи о традициях, здоровье и искусстве парения
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockBlogPosts.map((post) => (
          <Link to={`/blog/${post.slug}`} key={post.id}>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
              <div 
                className="h-48 bg-cover bg-center"
                style={{ backgroundImage: `url(${post.image})` }}
              />
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getCategoryColor(post.category)}>
                    {getCategoryLabel(post.category)}
                  </Badge>
                </div>
                <CardTitle className="font-serif text-xl hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {post.excerpt}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={16} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={16} />
                    <span>{new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BlogPage;
