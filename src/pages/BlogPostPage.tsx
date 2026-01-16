import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';

interface BlogPost {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  author_id: number;
  author_name: string;
  author_avatar?: string;
  author_bio?: string;
  cover_image?: string;
  published_at: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  tags: string[];
  reading_time: number;
}

interface Comment {
  id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  likes_count: number;
}

export default function BlogPostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [postId]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=get&post_id=${postId}`);
      const data = await response.json();
      setPost(data.post);
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await fetch(`https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=comments&post_id=${postId}`);
      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    
    try {
      await fetch(`https://functions.poehali.dev/75e27ae0-e41a-4c42-8f6a-0d66ca396765?action=like&post_id=${postId}`, {
        method: 'POST',
      });
      setLiked(!liked);
      setPost({
        ...post,
        likes_count: liked ? post.likes_count - 1 : post.likes_count + 1,
      });
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Icon name="FileX" className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Пост не найден</h2>
            <p className="text-gray-600 mb-6">Возможно, он был удалён или не существует</p>
            <Button onClick={() => navigate('/blog')} className="bg-gradient-to-r from-orange-500 to-amber-600">
              Вернуться к блогу
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate('/blog')}
          className="mb-6 hover:bg-orange-100"
        >
          <Icon name="ArrowLeft" className="h-4 w-4 mr-2" />
          Назад к блогу
        </Button>

        <article>
          {post.cover_image && (
            <div className="relative h-96 rounded-2xl overflow-hidden mb-8 shadow-2xl">
              <img
                src={post.cover_image}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="mb-6">
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {post.tags.map(tag => (
                  <Badge key={tag} className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            <h1 className="text-4xl md:text-5xl font-bold text-orange-900 mb-4 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Icon name="Calendar" className="h-4 w-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Clock" className="h-4 w-4" />
                <span>{post.reading_time} мин чтения</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="Eye" className="h-4 w-4" />
                <span>{post.views_count} просмотров</span>
              </div>
            </div>
          </div>

          <Card className="mb-8">
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none prose-headings:text-orange-900 prose-a:text-orange-600 prose-strong:text-orange-900"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={post.author_avatar} alt={post.author_name} />
                    <AvatarFallback className="bg-orange-200 text-orange-800 text-lg">
                      {post.author_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Link to={`/profile/${post.author_id}`} className="font-semibold text-lg text-orange-900 hover:text-orange-600">
                      {post.author_name}
                    </Link>
                    {post.author_bio && (
                      <p className="text-gray-600 text-sm mt-1">{post.author_bio}</p>
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className={liked ? 'border-red-500 text-red-500' : ''}
                  onClick={handleLike}
                >
                  <Icon name="Heart" className={`h-4 w-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                  {post.likes_count}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-8" />

          <div>
            <h2 className="text-2xl font-bold text-orange-900 mb-6 flex items-center gap-2">
              <Icon name="MessageSquare" className="h-6 w-6" />
              Комментарии ({comments.length})
            </h2>

            {comments.length === 0 ? (
              <Card className="border-orange-100">
                <CardContent className="py-12 text-center">
                  <Icon name="MessageSquare" className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">Пока нет комментариев</p>
                  <p className="text-gray-500 text-sm mt-2">Будьте первым, кто оставит комментарий!</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {comments.map(comment => (
                  <Card key={comment.id} className="border-orange-100">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={comment.user_avatar} alt={comment.user_name} />
                          <AvatarFallback className="bg-orange-200 text-orange-800 text-sm">
                            {comment.user_name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-gray-900">{comment.user_name}</span>
                            <span className="text-sm text-gray-500">
                              {formatDate(comment.created_at)}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{comment.content}</p>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-orange-600">
                            <Icon name="ThumbsUp" className="h-4 w-4 mr-1" />
                            {comment.likes_count}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}