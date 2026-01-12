import { useEffect, useState } from 'react';
import { useParams, Navigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { getBlogPostBySlug, getBlogPosts, BlogPost } from '@/lib/api';

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

const BlogPostPage = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      Promise.all([
        getBlogPostBySlug(slug),
        getBlogPosts()
      ])
        .then(([postData, allPosts]) => {
          setPost(postData);
          if (postData) {
            setRelatedPosts(
              allPosts
                .filter(p => p.category === postData.category && p.id !== postData.id)
                .slice(0, 3)
            );
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }
  
  if (!post) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="animate-fade-in">
      <div 
        className="relative h-[50vh] bg-cover bg-center"
        style={{ backgroundImage: `url(${post.image_url})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/20" />
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-12">
            <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <Icon name="ArrowLeft" size={20} />
              <span>К энциклопедии</span>
            </Link>
            <Badge className={`${getCategoryColor(post.category)} mb-4`}>
              {getCategoryLabel(post.category)}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4 max-w-4xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap gap-4 items-center text-white/90">
              <div className="flex items-center gap-2">
                <Icon name="User" size={20} />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Calendar" size={20} />
                <span>{new Date(post.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {post.excerpt}
            </p>
            
            <Separator className="my-8" />

            <div 
              className="space-y-6 text-foreground leading-relaxed"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </div>

          <Separator className="my-12" />

          <div className="flex justify-center gap-4">
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Share2" size={20} />
              Поделиться
            </Button>
            <Button variant="outline" size="lg" className="gap-2">
              <Icon name="Bookmark" size={20} />
              Сохранить
            </Button>
          </div>

          {relatedPosts.length > 0 && (
            <>
              <Separator className="my-12" />
              
              <div>
                <h2 className="text-3xl font-serif font-bold mb-6">Читайте также</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((relatedPost) => (
                    <Link to={`/blog/${relatedPost.slug}`} key={relatedPost.id}>
                      <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                        <div 
                          className="h-40 bg-cover bg-center"
                          style={{ backgroundImage: `url(${relatedPost.image_url})` }}
                        />
                        <CardHeader>
                          <Badge className={`${getCategoryColor(relatedPost.category)} w-fit mb-2`}>
                            {getCategoryLabel(relatedPost.category)}
                          </Badge>
                          <CardTitle className="font-serif text-lg hover:text-primary transition-colors line-clamp-2">
                            {relatedPost.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedPost.excerpt}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="font-serif text-2xl">Остались вопросы?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Присоединяйтесь к нашему сообществу и обсуждайте банные традиции с единомышленниками
                </p>
                <Button size="lg" className="gap-2">
                  <Icon name="MessageCircle" size={20} />
                  Перейти в Telegram
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPostPage;
