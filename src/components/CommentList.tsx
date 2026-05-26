import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SocialComment, SocialUser } from '../types';
import { UserAvatar } from './UserAvatar';

type CommentListProps = {
  comments: SocialComment[];
  usersById: Record<string, SocialUser>;
  currentUserName?: string;
  onToggleLike?: (commentId: string) => void;
};

export function CommentList({
  comments,
  usersById,
  currentUserName = 'Enes',
  onToggleLike,
}: CommentListProps) {
  if (comments.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="chatbubble-ellipses-outline" size={22} color={theme.colors.subtle} />
        <Text style={styles.emptyTitle}>Ilk yorumu sen yaz</Text>
        <Text style={styles.emptyText}>Tarif hakkindaki deneyimin burada gorunecek.</Text>
      </View>
    );
  }

  return (
    <View style={styles.list}>
      {comments.map((comment) => {
        const user = usersById[comment.userId];
        const name = user?.name ?? currentUserName;
        const replyUser = comment.chefReply ? usersById[comment.chefReply.userId] : undefined;

        return (
          <View key={comment.id} style={styles.item}>
            <UserAvatar uri={user?.avatarUrl} name={name} size={36} />
            <View style={styles.copy}>
              <View style={styles.header}>
                <View style={styles.nameWrap}>
                  <Text style={styles.name}>{name}</Text>
                  {user?.level ? <Text style={styles.userBadge}>{user.level}</Text> : null}
                </View>
                <Text style={styles.time}>{comment.createdAt}</Text>
              </View>
              <Text style={styles.text}>{comment.text}</Text>
              {comment.chefReply ? (
                <View style={styles.chefReply}>
                  <View style={styles.chefReplyHeader}>
                    <Ionicons name="checkmark-circle" size={14} color={theme.colors.primary} />
                    <Text style={styles.chefReplyTitle}>Şef yanıtladı</Text>
                    <Text style={styles.chefReplyTime}>{comment.chefReply.createdAt}</Text>
                  </View>
                  <Text style={styles.chefReplyText}>
                    {replyUser?.name ? `${replyUser.name}: ` : ''}
                    {comment.chefReply.text}
                  </Text>
                </View>
              ) : null}
              <View style={styles.footer}>
                <TouchableOpacity
                  onPress={() => onToggleLike?.(comment.id)}
                  activeOpacity={0.78}
                  style={styles.likeButton}
                >
                  <Ionicons
                    name={comment.liked ? 'heart' : 'heart-outline'}
                    size={14}
                    color={comment.liked ? theme.colors.primary : theme.colors.subtle}
                  />
                  <Text style={[styles.footerText, comment.liked && styles.activeFooterText]}>{comment.likes}</Text>
                </TouchableOpacity>
                <Text style={styles.reply}>Yanitla</Text>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    gap: 10,
  },
  copy: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  nameWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
  },
  userBadge: {
    maxWidth: 116,
    borderRadius: theme.radius.pill,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3,
    color: theme.colors.primary,
    fontSize: 9,
    fontWeight: '900',
    overflow: 'hidden',
  },
  time: {
    color: theme.colors.subtle,
    fontSize: 10,
    fontWeight: '800',
  },
  text: {
    marginTop: 6,
    color: theme.colors.muted,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerText: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
  activeFooterText: {
    color: theme.colors.primary,
  },
  reply: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  chefReply: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFE0CF',
    backgroundColor: '#FFF8F4',
    padding: 10,
  },
  chefReplyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chefReplyTitle: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: '900',
  },
  chefReplyTime: {
    marginLeft: 'auto',
    color: theme.colors.subtle,
    fontSize: 9,
    fontWeight: '800',
  },
  chefReplyText: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '800',
  },
  empty: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    padding: 18,
    alignItems: 'center',
    gap: 5,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  emptyText: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
