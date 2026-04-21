'use client'
import { formatCurrency } from '@/lib/utils'
import { ProductResType, SKUSResType } from '@/schemaValidations/product.schema'
import Image from 'next/image'
import envConfig, { Locale } from '@/config'
import { useState, useRef, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  ShoppingCart,
  Zap,
  Shield,
  RotateCcw,
  ChevronRight,
  Star,
  Check,
  ThumbsUp,
  MessageCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Search,
  User
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { useAddCartMutation } from '@/queries/useCart'
import { toast } from '@/components/ui/use-toast'
import { useRouter } from '@/i18n/routing'

interface Review {
  id: number
  author: string
  avatar?: string
  rating: number
  date: string
  variant?: string
  content: string
  images?: string[]
  helpful: number
  verified: boolean
}

interface QnA {
  id: number
  question: string
  askedBy: string
  askedAt: string
  answer?: string
  answeredBy?: string
  answeredAt?: string
  helpful: number
}

const MOCK_REVIEWS: Review[] = [
  {
    id: 1,
    author: 'Nguyễn Minh Tuấn',
    rating: 5,
    date: '2026-03-15',
    variant: '16GB - Trắng',
    content:
      'Laptop siêu nhẹ, pin trâu dùng được cả ngày làm việc. Màn hình hiển thị sắc nét, bàn phím gõ rất êm. Rất hài lòng với sản phẩm này, xứng đáng với giá tiền.',
    helpful: 24,
    verified: true
  },
  {
    id: 2,
    author: 'Trần Thị Lan',
    rating: 4,
    date: '2026-03-10',
    variant: '32GB - Đen',
    content:
      'Máy chạy nhanh, đa nhiệm tốt. Chỉ hơi tiếc là loa không to lắm. Nhưng nhìn chung rất đáng mua cho dân văn phòng hay lập trình.',
    helpful: 11,
    verified: true
  },
  {
    id: 3,
    author: 'Phạm Quốc Huy',
    rating: 5,
    date: '2026-02-28',
    variant: '16GB - Đen',
    content:
      'Thiết kế đẹp, mỏng nhẹ đáng kinh ngạc. Mang đi công tác không thấy nặng tay chút nào. Pin 20 tiếng theo quảng cáo thì thực tế được ~14–16 tiếng, vẫn rất ổn.',
    helpful: 18,
    verified: false
  },
  {
    id: 4,
    author: 'Lê Thị Hoa',
    rating: 3,
    date: '2026-02-20',
    variant: '32GB - Trắng',
    content:
      'Máy ổn, nhưng màu trắng dễ bẩn hơn tôi nghĩ. Hiệu năng tốt nhưng giá hơi cao so với đối thủ. Sẽ cân nhắc kỹ hơn nếu mua lần sau.',
    helpful: 5,
    verified: true
  }
]

const MOCK_QNA: QnA[] = [
  {
    id: 1,
    question: 'Laptop này có hỗ trợ Thunderbolt 4 không?',
    askedBy: 'Hùng Trần',
    askedAt: '2026-03-20',
    answer:
      'Có, LG Gram 2024 hỗ trợ 2 cổng Thunderbolt 4, cho phép kết nối màn hình ngoài 4K và sạc nhanh qua cổng USB-C.',
    answeredBy: 'Shop',
    answeredAt: '2026-03-20',
    helpful: 9
  },
  {
    id: 2,
    question: 'RAM có nâng cấp được không hay hàn liền?',
    askedBy: 'Minh Đức',
    askedAt: '2026-03-18',
    answer:
      'RAM hàn liền trên bo mạch chủ, không nâng cấp được sau khi mua. Bạn nên chọn đúng cấu hình RAM ngay từ đầu.',
    answeredBy: 'Shop',
    answeredAt: '2026-03-18',
    helpful: 14
  },
  {
    id: 3,
    question: 'Máy có chạy được game AAA không?',
    askedBy: 'Tuấn Anh',
    askedAt: '2026-03-05',
    helpful: 3
  }
]

function StarRow({
  rating,
  size = 'sm',
  interactive = false,
  onChange
}: {
  rating: number
  size?: 'sm' | 'md' | 'lg'
  interactive?: boolean
  onChange?: (v: number) => void
}) {
  const [hovered, setHovered] = useState(0)
  const sz = size === 'lg' ? 'w-7 h-7' : size === 'md' ? 'w-5 h-5' : 'w-4 h-4'
  const display = interactive ? hovered || rating : rating

  return (
    <div className='flex items-center gap-0.5'>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            sz,
            'transition-colors duration-100',
            s <= display ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted-foreground/30',
            interactive && 'cursor-pointer hover:scale-110 transition-transform'
          )}
          onMouseEnter={() => interactive && setHovered(s)}
          onMouseLeave={() => interactive && setHovered(0)}
          onClick={() => interactive && onChange?.(s)}
        />
      ))}
    </div>
  )
}

function RatingSummary({ reviews }: { reviews: Review[] }) {
  const t = useTranslations('ProductDetail.reviews')
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / (reviews.length || 1)
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length ? (reviews.filter((r) => r.rating === star).length / reviews.length) * 100 : 0
  }))

  return (
    <div className='flex flex-col sm:flex-row gap-6 items-start sm:items-center p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-800/30'>
      <div className='flex flex-col items-center min-w-[90px] gap-1'>
        <span className='text-5xl font-bold text-amber-500 leading-none'>{avg.toFixed(1)}</span>
        <StarRow rating={Math.round(avg)} size='sm' />
        <span className='text-xs text-muted-foreground mt-1'>{t('count', { count: reviews.length })}</span>
      </div>
      <div className='flex-1 space-y-1.5 w-full'>
        {dist.map(({ star, count, pct }) => (
          <div key={star} className='flex items-center gap-2 text-xs'>
            <span className='w-3 text-right text-muted-foreground'>{star}</span>
            <Star className='w-3 h-3 fill-amber-400 text-amber-400 shrink-0' />
            <div className='flex-1 h-2 rounded-full bg-muted overflow-hidden'>
              <div
                className='h-full rounded-full bg-amber-400 transition-all duration-500'
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className='w-5 text-right text-muted-foreground'>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewCard({ review }: { review: Review }) {
  const t = useTranslations('ProductDetail.reviews')
  const [helpful, setHelpful] = useState(review.helpful)
  const [voted, setVoted] = useState(false)

  const initials = review.author
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  return (
    <div className='py-5 border-b border-border last:border-0 space-y-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='flex items-center gap-3'>
          <div className='w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center text-xs font-bold text-orange-600 dark:text-orange-400 shrink-0'>
            {initials}
          </div>
          <div>
            <div className='flex items-center gap-2 flex-wrap'>
              <span className='text-sm font-semibold'>{review.author}</span>
              {review.verified && (
                <span className='flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 px-1.5 py-0.5 rounded-full border border-green-200/50 dark:border-green-800/50'>
                  <Check className='w-2.5 h-2.5' />
                  {t('verified')}
                </span>
              )}
            </div>
            <div className='flex items-center gap-2 mt-0.5 flex-wrap'>
              <StarRow rating={review.rating} size='sm' />
              {review.variant && (
                <span className='text-[11px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded'>
                  {review.variant}
                </span>
              )}
            </div>
          </div>
        </div>
        <span className='text-xs text-muted-foreground shrink-0'>
          {new Date(review.date).toLocaleDateString('vi-VN')}
        </span>
      </div>
      <p className='text-sm text-foreground/90 leading-relaxed pl-12'>{review.content}</p>
      {review.images?.length && (
        <div className='flex gap-2 pl-12'>
          {review.images.map((img, i) => (
            <div key={i} className='w-16 h-16 rounded-lg overflow-hidden border border-border'>
              <Image src={img} width={64} height={64} alt='' className='object-cover w-full h-full' />
            </div>
          ))}
        </div>
      )}
      <div className='pl-12'>
        <button
          onClick={() => {
            if (!voted) {
              setHelpful((p) => p + 1)
              setVoted(true)
            }
          }}
          className={cn(
            'flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border transition-colors',
            voted
              ? 'border-orange-400 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30'
              : 'border-border text-muted-foreground hover:border-orange-400 hover:text-orange-500'
          )}
        >
          <ThumbsUp className='w-3 h-3' />
          {t('helpful', { count: helpful })}
        </button>
      </div>
    </div>
  )
}

function WriteReviewForm({ onSubmit }: { onSubmit: (r: Omit<Review, 'id' | 'helpful' | 'verified'>) => void }) {
  const t = useTranslations('ProductDetail.reviews')
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const ratingLabels = t.raw('ratingLabels') as string[]

  const handleSubmit = () => {
    if (!rating || !content.trim() || !author.trim()) return
    onSubmit({ author, rating, date: new Date().toISOString().split('T')[0], content })
    setSubmitted(true)
    setOpen(false)
    setRating(0)
    setContent('')
    setAuthor('')
  }

  if (submitted)
    return (
      <div className='flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/40 px-4 py-3 rounded-xl border border-green-200/60 dark:border-green-800/40'>
        <Check className='w-4 h-4 shrink-0' />
        {t('writeSuccess')}
      </div>
    )

  return (
    <div className='rounded-xl border border-border overflow-hidden'>
      <button
        onClick={() => setOpen((p) => !p)}
        className='w-full flex items-center justify-between px-4 py-3 bg-muted/30 hover:bg-muted/60 transition-colors text-sm font-semibold'
      >
        <span className='flex items-center gap-2'>
          <Star className='w-4 h-4 text-amber-400' />
          {t('writeTitle')}
        </span>
        {open ? (
          <ChevronUp className='w-4 h-4 text-muted-foreground' />
        ) : (
          <ChevronDown className='w-4 h-4 text-muted-foreground' />
        )}
      </button>

      {open && (
        <div className='p-4 space-y-4 border-t border-border'>
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground'>{t('writeName')}</label>
            <Input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder={t('writeNamePlaceholder')}
              className='h-9 text-sm'
            />
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground'>{t('writeRating')}</label>
            <div className='flex items-center gap-2'>
              <StarRow rating={rating} size='lg' interactive onChange={setRating} />
              {rating > 0 && <span className='text-sm text-amber-500 font-medium'>{ratingLabels[rating]}</span>}
            </div>
          </div>
          <div className='space-y-1.5'>
            <label className='text-xs font-medium text-muted-foreground'>{t('writeContent')}</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t('writeContentPlaceholder')}
              rows={4}
              className='text-sm resize-none'
            />
          </div>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              onClick={handleSubmit}
              disabled={!rating || !content.trim() || !author.trim()}
              className='bg-orange-500 hover:bg-orange-600 text-white'
            >
              <Send className='w-3.5 h-3.5 mr-1.5' />
              {t('writeSubmit')}
            </Button>
            <Button size='sm' variant='ghost' onClick={() => setOpen(false)} className='text-muted-foreground'>
              {t('writeCancel')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ReviewsSection() {
  const t = useTranslations('ProductDetail.reviews')
  const tRoot = useTranslations('ProductDetail')
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS)
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [sort, setSort] = useState<'newest' | 'helpful'>('newest')

  const filtered = useMemo(() => {
    let list = filter === 'all' ? reviews : reviews.filter((r) => r.rating === filter)
    return [...list].sort((a, b) =>
      sort === 'newest' ? new Date(b.date).getTime() - new Date(a.date).getTime() : b.helpful - a.helpful
    )
  }, [reviews, filter, sort])

  return (
    <section className='space-y-5' id='reviews'>
      <div className='flex items-center justify-between flex-wrap gap-2'>
        <h2 className='text-xl font-bold flex items-center gap-2'>
          <Star className='w-5 h-5 fill-amber-400 text-amber-400' />
          {t('title')}
        </h2>
        <WriteReviewForm
          onSubmit={(r) => setReviews((prev) => [{ ...r, id: Date.now(), helpful: 0, verified: false }, ...prev])}
        />
      </div>

      <RatingSummary reviews={reviews} />

      <div className='flex items-center gap-2 flex-wrap'>
        <span className='text-xs text-muted-foreground font-medium'>{t('filterLabel')}</span>
        {(['all', 5, 4, 3, 2, 1] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border transition-colors',
              filter === f
                ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                : 'border-border hover:border-amber-300 text-muted-foreground'
            )}
          >
            {f === 'all' ? (
              t('filterAll')
            ) : (
              <>
                {f} <Star className='w-2.5 h-2.5 fill-amber-400 text-amber-400' />
                <span>({reviews.filter((r) => r.rating === f).length})</span>
              </>
            )}
          </button>
        ))}

        <div className='ml-auto flex items-center gap-1'>
          {(['newest', 'helpful'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={cn(
                'text-xs px-2.5 py-1 rounded-full border transition-colors',
                sort === s
                  ? 'border-orange-400 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300'
                  : 'border-border hover:border-orange-300 text-muted-foreground'
              )}
            >
              {s === 'newest' ? t('sortNewest') : t('sortHelpful')}
            </button>
          ))}
        </div>
      </div>

      <div className='divide-y divide-border rounded-xl border border-border px-4 overflow-hidden'>
        {filtered.length > 0 ? (
          filtered.map((r) => <ReviewCard key={r.id} review={r} />)
        ) : (
          <div className='py-10 text-center text-sm text-muted-foreground'>{t('empty')}</div>
        )}
      </div>
    </section>
  )
}

function QnASection() {
  const t = useTranslations('ProductDetail.qna')
  const [qnas, setQnas] = useState<QnA[]>(MOCK_QNA)
  const [search, setSearch] = useState('')
  const [question, setQuestion] = useState('')
  const [askedBy, setAskedBy] = useState('')
  const [expanded, setExpanded] = useState<number | null>(1)
  const [submitted, setSubmitted] = useState(false)

  const filtered = useMemo(
    () => qnas.filter((q) => q.question.toLowerCase().includes(search.toLowerCase())),
    [qnas, search]
  )

  const handleAsk = () => {
    if (!question.trim() || !askedBy.trim()) return
    setQnas((prev) => [
      { id: Date.now(), question, askedBy, askedAt: new Date().toISOString().split('T')[0], helpful: 0 },
      ...prev
    ])
    setQuestion('')
    setAskedBy('')
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 4000)
  }

  return (
    <section className='space-y-5' id='qna'>
      <h2 className='text-xl font-bold flex items-center gap-2'>
        <MessageCircle className='w-5 h-5 text-blue-500' />
        {t('title')}
        <span className='text-sm font-normal text-muted-foreground'>
          ({t('questionCount', { count: qnas.length })})
        </span>
      </h2>

      <div className='rounded-2xl border border-blue-200/60 dark:border-blue-800/30 bg-blue-50/40 dark:bg-blue-950/20 p-4 space-y-3'>
        <p className='text-sm font-semibold text-blue-700 dark:text-blue-400'>{t('askTitle')}</p>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
          <Input
            value={askedBy}
            onChange={(e) => setAskedBy(e.target.value)}
            placeholder={t('askNamePlaceholder')}
            className='h-9 text-sm bg-white dark:bg-background'
          />
          <div className='sm:col-span-2 relative'>
            <Textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t('askPlaceholder')}
              rows={2}
              className='text-sm resize-none bg-white dark:bg-background pr-24'
            />
            <Button
              size='sm'
              onClick={handleAsk}
              disabled={!question.trim() || !askedBy.trim()}
              className='absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs'
            >
              <Send className='w-3 h-3 mr-1' />
              {t('askSubmit')}
            </Button>
          </div>
        </div>
        {submitted && (
          <p className='text-xs text-green-600 dark:text-green-400 flex items-center gap-1'>
            <Check className='w-3.5 h-3.5' />
            {t('askSuccess')}
          </p>
        )}
      </div>

      <div className='relative'>
        <Search className='absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none' />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className='pl-9 h-9 text-sm'
        />
      </div>

      <div className='space-y-3'>
        {filtered.length === 0 && <p className='text-sm text-muted-foreground text-center py-6'>{t('empty')}</p>}
        {filtered.map((qna) => (
          <div
            key={qna.id}
            className={cn(
              'rounded-xl border overflow-hidden transition-colors',
              expanded === qna.id ? 'border-blue-300/60 dark:border-blue-700/50' : 'border-border'
            )}
          >
            <button
              className='w-full flex items-start gap-3 px-4 py-3 hover:bg-muted/40 transition-colors text-left'
              onClick={() => setExpanded((p) => (p === qna.id ? null : qna.id))}
            >
              <div className='w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0 mt-0.5'>
                <User className='w-3.5 h-3.5 text-blue-500' />
              </div>
              <div className='flex-1 min-w-0'>
                <p className='text-sm font-medium leading-snug'>{qna.question}</p>
                <p className='text-xs text-muted-foreground mt-0.5'>
                  {qna.askedBy} · {new Date(qna.askedAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className='flex items-center gap-2 shrink-0'>
                {qna.answer && (
                  <span className='text-[10px] px-1.5 py-0.5 rounded bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border border-green-200/60 dark:border-green-800/40'>
                    {t('answered')}
                  </span>
                )}
                {expanded === qna.id ? (
                  <ChevronUp className='w-4 h-4 text-muted-foreground' />
                ) : (
                  <ChevronDown className='w-4 h-4 text-muted-foreground' />
                )}
              </div>
            </button>
            {expanded === qna.id && (
              <div className='border-t border-border bg-muted/20'>
                {qna.answer ? (
                  <div className='flex items-start gap-3 px-4 py-3'>
                    <div className='w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950 flex items-center justify-center shrink-0 mt-0.5'>
                      <MessageCircle className='w-3.5 h-3.5 text-orange-500' />
                    </div>
                    <div className='flex-1'>
                      <div className='flex items-center gap-1.5 mb-1'>
                        <span className='text-xs font-semibold text-orange-600 dark:text-orange-400'>
                          {qna.answeredBy}
                        </span>
                        {qna.answeredAt && (
                          <span className='text-xs text-muted-foreground'>
                            · {new Date(qna.answeredAt).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <p className='text-sm text-foreground/90 leading-relaxed'>{qna.answer}</p>
                    </div>
                  </div>
                ) : (
                  <div className='px-4 py-3 text-sm text-muted-foreground italic'>{t('pending')}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function PriceBadge({ price, virtual }: { price: number; virtual?: number }) {
  const t = useTranslations('ProductDetail')
  return (
    <div className='flex items-baseline gap-3 flex-wrap'>
      <span className='text-3xl md:text-4xl font-bold tracking-tight text-orange-500'>{formatCurrency(price)}</span>
      {virtual && virtual > price && (
        <span className='text-lg text-muted-foreground line-through'>{formatCurrency(virtual)}</span>
      )}
      {virtual && virtual > price && (
        <Badge className='bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full'>
          {t('discount', { percent: Math.round(((virtual - price) / virtual) * 100) })}
        </Badge>
      )}
    </div>
  )
}

function ImageGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0)
  const [zoom, setZoom] = useState(false)
  const [pos, setPos] = useState({ x: 50, y: 50 })
  const imgRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = imgRef.current?.getBoundingClientRect()
    if (!rect) return
    setPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100
    })
  }

  return (
    <div className='flex flex-col gap-3'>
      <div
        ref={imgRef}
        className='relative overflow-hidden rounded-2xl border border-border bg-muted/30 aspect-square cursor-zoom-in select-none'
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
      >
        <Image
          src={images[active]}
          fill
          quality={90}
          alt={name}
          priority
          sizes='(max-width: 768px) 100vw, 50vw'
          className={cn('object-contain transition-transform duration-200', zoom ? 'scale-150' : 'scale-100')}
          style={zoom ? { transformOrigin: `${pos.x}% ${pos.y}%` } : {}}
        />
      </div>
      {images.length > 1 && (
        <div className='flex gap-2 flex-wrap'>
          {images.map((url, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={cn(
                'relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 shrink-0',
                active === i
                  ? 'border-orange-500 shadow-md shadow-orange-500/20'
                  : 'border-border hover:border-orange-300 opacity-60 hover:opacity-100'
              )}
            >
              <Image src={url} fill alt='' sizes='64px' className='object-contain' />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function VariantSelector({
  variants,
  skus,
  selectedSku,
  onSkuChange
}: {
  variants: ProductResType['variants']
  skus: ProductResType['skus']
  selectedSku: SKUSResType | null
  onSkuChange: (sku: SKUSResType | null) => void
}) {
  // selected = { [variantValue]: optionValue } — chỉ dùng để hiện UI
  const [selected, setSelected] = useState<Record<string, string>>({})

  const handleSelect = (variantValue: string, optionValue: string) => {
    const next = { ...selected, [variantValue]: optionValue }
    setSelected(next)

    // SKU value = options nối theo thứ tự variants, ngăn cách bằng '-'
    const allPicked = variants.every((v) => next[v.value])
    if (allPicked) {
      const combo = variants.map((v) => next[v.value]).join('-')
      const match = skus.find((s) => s.value === combo) ?? null
      onSkuChange(match)
    } else {
      onSkuChange(null)
    }
  }

  const allPicked = variants.every((v) => selected[v.value])

  return (
    <div className='space-y-4'>
      {variants.map((variant) => (
        <div key={variant.value} className='space-y-2'>
          <div className='text-sm font-medium text-muted-foreground'>
            {variant.value}
            {selected[variant.value] && (
              <span className='ml-2 text-foreground font-semibold'>{selected[variant.value]}</span>
            )}
          </div>
          <div className='flex flex-wrap gap-2'>
            {variant.options.map((opt) => (
              <button
                key={opt}
                onClick={() => handleSelect(variant.value, opt)}
                className={cn(
                  'px-4 py-1.5 rounded-full border text-sm font-medium transition-all duration-150',
                  selected[variant.value] === opt
                    ? 'border-orange-500 bg-orange-500/10 text-orange-600 dark:text-orange-400 shadow-sm'
                    : 'border-border hover:border-orange-400 hover:bg-muted/60'
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Stock info */}
      {selectedSku && (
        <div className='flex items-center gap-2 text-sm'>
          <div className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
          <span className='text-muted-foreground'>
            Còn <span className='font-semibold text-foreground'>{selectedSku.stock}</span> sản phẩm
          </span>
        </div>
      )}

      {/* Out of stock notice */}
      {allPicked && !selectedSku && <p className='text-sm text-destructive'>Phân loại này hiện không có hàng.</p>}
    </div>
  )
}

function SpecGroups({ specGroups, locale }: { specGroups: ProductResType['specGroups']; locale: Locale }) {
  const t = useTranslations('ProductDetail.specs')
  const [open, setOpen] = useState<Record<number, boolean>>({ 0: true })
  if (!specGroups?.length) return null

  return (
    <section className='space-y-3'>
      <h2 className='text-xl font-bold'>{t('title')}</h2>
      <div className='divide-y divide-border rounded-xl border border-border overflow-hidden'>
        {specGroups.map((group, gIdx) => {
          const label =
            group.translations?.find((tr) => tr.languageId === locale)?.label ??
            group.translations?.[0]?.label ??
            group.key
          const isOpen = open[gIdx] ?? false
          return (
            <div key={group.id ?? gIdx}>
              <button
                className='w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-muted/40 transition-colors text-left'
                onClick={() => setOpen((p) => ({ ...p, [gIdx]: !p[gIdx] }))}
              >
                <span>{label}</span>
                <ChevronRight
                  className={cn(
                    'h-4 w-4 text-muted-foreground transition-transform duration-200',
                    isOpen && 'rotate-90'
                  )}
                />
              </button>
              {isOpen && (
                <div className='bg-muted/20'>
                  {group.specs.map((spec, sIdx) => {
                    const tr = spec.translations?.find((tr) => tr.languageId === locale) ?? spec.translations?.[0]
                    return (
                      <div
                        key={spec.id ?? sIdx}
                        className={cn(
                          'grid grid-cols-2 gap-4 px-4 py-2.5 text-sm',
                          sIdx % 2 === 0 ? 'bg-transparent' : 'bg-muted/30'
                        )}
                      >
                        <span className='text-muted-foreground font-medium'>{tr?.label ?? spec.key}</span>
                        <span className='text-foreground whitespace-pre-line'>{tr?.value ?? '-'}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function Highlights({ translation }: { translation: ProductResType['productTranslations'][number] | undefined }) {
  const t = useTranslations('ProductDetail.highlights')
  const highlights = translation?.highlights
  if (!highlights) return null

  return (
    <section className='space-y-4'>
      <h2 className='text-lg font-semibold'>{t('title')}</h2>
      {highlights.summary && (
        <p className='text-muted-foreground leading-relaxed text-sm border-l-2 border-orange-500 pl-4'>
          {highlights.summary}
        </p>
      )}
      {highlights.sections?.length > 0 && (
        <div className='space-y-5'>
          {highlights.sections
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((section, i) => (
              <div key={i} className='space-y-2'>
                <div className='flex items-start gap-2'>
                  <div className='mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/15 flex items-center justify-center'>
                    <Check className='w-3 h-3 text-orange-500' strokeWidth={2.5} />
                  </div>
                  <h3 className='text-sm font-semibold'>{section.heading}</h3>
                </div>
                <div
                  className='text-sm text-muted-foreground leading-relaxed pl-7'
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
              </div>
            ))}
        </div>
      )}
    </section>
  )
}

function TrustBadges() {
  const t = useTranslations('ProductDetail.trust')
  const items = [
    { icon: Shield, label: t('warranty') },
    { icon: RotateCcw, label: t('returns') },
    { icon: Zap, label: t('express') },
    { icon: Star, label: t('genuine') }
  ]

  return (
    <div className='grid grid-cols-2 gap-2'>
      {items.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className='flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground bg-muted/20 hover:bg-muted/40 transition-colors'
        >
          <Icon className='w-3.5 h-3.5 text-orange-500 shrink-0' />
          {label}
        </div>
      ))}
    </div>
  )
}

function TabNav({ avgRating, reviewCount }: { avgRating: number; reviewCount: number }) {
  const t = useTranslations('ProductDetail.tabs')

  const tabs = [
    { id: 'specs', label: t('specs') },
    { id: 'highlights', label: t('highlights') },
    {
      id: 'reviews',
      label: (
        <span className='flex items-center gap-1.5'>
          {t('reviews')}
          <span className='flex items-center gap-0.5 text-amber-500 font-bold'>
            <Star className='w-3 h-3 fill-amber-400' />
            {avgRating.toFixed(1)}
          </span>
          <span className='text-xs bg-orange-100 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded-full'>
            {reviewCount}
          </span>
        </span>
      )
    },
    { id: 'qna', label: t('qna') }
  ]

  return (
    <nav className='flex gap-1 border-b border-border sticky top-0 bg-background z-10 -mx-4 px-4 overflow-x-auto'>
      {tabs.map((tab) => (
        <a
          key={tab.id}
          href={`#${tab.id}`}
          className='flex-shrink-0 px-3 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-orange-400 transition-colors whitespace-nowrap'
        >
          {tab.label}
        </a>
      ))}
    </nav>
  )
}

export default function ProductDetail({ product, locale }: { product: ProductResType | undefined; locale: Locale }) {
  const router = useRouter()
  const t = useTranslations('ProductDetail')
  const addCartMutation = useAddCartMutation()

  const [selectedSku, setSelectedSku] = useState<SKUSResType | null>(null)

  const activeSku: SKUSResType | null =
    selectedSku ?? (product && !product.variants?.length ? (product.skus?.[0] ?? null) : null)

  if (!product)
    return (
      <div className='flex flex-col items-center justify-center min-h-[40vh] gap-3'>
        <div className='text-5xl'>😶</div>
        <h1 className='text-2xl font-semibold'>{t('notFound')}</h1>
        <p className='text-muted-foreground text-sm'>{t('notFoundDesc')}</p>
      </div>
    )

  const translation = product.productTranslations?.find((tr) => tr.languageId === locale)
  const categoryNames = product.categories?.flatMap((c) => c.childrenCategories ?? []).map((c) => c.name)
  const avgRating = MOCK_REVIEWS.reduce((s, r) => s + r.rating, 0) / MOCK_REVIEWS.length

  const displayPrice = activeSku?.price ?? product.basePrice

  const guardSku = (): boolean => {
    if (activeSku) return true
    toast({
      variant: 'destructive',
      description: product.variants?.length > 0 ? 'Vui lòng chọn phân loại sản phẩm.' : 'Sản phẩm hiện không có hàng.'
    })
    return false
  }

  const handleAddToCart = async () => {
    if (!guardSku() || addCartMutation.isPending) return
    try {
      await addCartMutation.mutateAsync({ skuId: activeSku!.id, quantity: 1 })
      toast({ description: 'Đã thêm vào giỏ hàng!' })
    } catch {
      toast({ variant: 'destructive', description: 'Không thể thêm vào giỏ hàng.' })
    }
  }

  const handleBuyNow = async () => {
    if (!guardSku() || addCartMutation.isPending) return
    try {
      await addCartMutation.mutateAsync({ skuId: activeSku!.id, quantity: 1 })
      router.push(`/client/cart`)
    } catch {
      toast({ variant: 'destructive', description: 'Có lỗi xảy ra, vui lòng thử lại.' })
    }
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8 space-y-12'>
      <nav className='flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap'>
        <span className='hover:text-foreground cursor-pointer transition-colors'>{t('home')}</span>
        <ChevronRight className='w-3 h-3' />
        {categoryNames?.map((name, i) => (
          <span key={i} className='flex items-center gap-1.5'>
            <span className='hover:text-foreground cursor-pointer transition-colors'>{name}</span>
            {i < categoryNames.length - 1 && <ChevronRight className='w-3 h-3' />}
          </span>
        ))}
        {categoryNames?.length > 0 && <ChevronRight className='w-3 h-3' />}
        <span className='text-foreground font-medium truncate max-w-[200px]'>{product.name}</span>
      </nav>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12'>
        <div className='lg:sticky lg:top-6 self-start'>
          <ImageGallery images={product.images} name={product.name} />
        </div>

        <div className='space-y-6'>
          <div className='space-y-2'>
            <div className='flex items-center gap-2 flex-wrap'>
              {product.brand && (
                <Badge variant='outline' className='text-xs font-semibold uppercase tracking-wide'>
                  {product.brand.name}
                </Badge>
              )}
              {categoryNames?.map((name) => (
                <Badge key={name} variant='secondary' className='text-xs'>
                  {name}
                </Badge>
              ))}
            </div>
            <h1 className='text-2xl md:text-3xl font-bold leading-tight tracking-tight'>{product.name}</h1>
            <a href='#reviews' className='flex items-center gap-2 hover:opacity-80 transition-opacity w-fit group'>
              <StarRow rating={Math.round(avgRating)} size='sm' />
              <span className='text-sm font-semibold text-amber-500'>{avgRating.toFixed(1)}</span>
              <span className='text-xs text-muted-foreground group-hover:text-orange-500 transition-colors underline underline-offset-2'>
                {t('reviews.count', { count: MOCK_REVIEWS.length })}
              </span>
            </a>
          </div>

          <PriceBadge price={displayPrice} virtual={product.virtualPrice} />

          {product.variants?.length > 0 && (
            <VariantSelector
              variants={product.variants}
              skus={product.skus}
              selectedSku={selectedSku}
              onSkuChange={setSelectedSku}
            />
          )}

          <div className='flex flex-col sm:flex-row gap-3'>
            <Button
              size='lg'
              onClick={handleAddToCart}
              disabled={addCartMutation.isPending}
              className='flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl h-12 shadow-lg shadow-orange-500/25 transition-all duration-200 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:translate-y-0'
            >
              <ShoppingCart className='w-4 h-4 mr-2' />
              {addCartMutation.isPending ? 'Đang xử lý...' : t('addToCart')}
            </Button>
            <Button
              size='lg'
              variant='outline'
              onClick={handleBuyNow}
              disabled={addCartMutation.isPending}
              className='flex-1 rounded-xl h-12 font-semibold border-2 hover:border-orange-500 hover:text-orange-600 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:translate-y-0'
            >
              {t('buyNow')}
            </Button>
          </div>

          <TrustBadges />

          <div className='hidden lg:block pt-2 border-t border-border'>
            <Highlights translation={translation} />
          </div>
        </div>
      </div>

      <div className='lg:hidden'>
        <Highlights translation={translation} />
      </div>

      <TabNav avgRating={avgRating} reviewCount={MOCK_REVIEWS.length} />

      <div id='specs'>
        <SpecGroups specGroups={product.specGroups} locale={locale} />
      </div>

      <ReviewsSection />
      <QnASection />

      {translation?.description && (
        <section className='space-y-3'>
          <h2 className='text-lg font-semibold'>{t('description.title')}</h2>
          <div
            className='prose prose-sm dark:prose-invert max-w-none text-muted-foreground'
            dangerouslySetInnerHTML={{ __html: translation.description }}
          />
        </section>
      )}
    </div>
  )
}
