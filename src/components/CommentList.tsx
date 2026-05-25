import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../constants/theme';
import { SocialComment, SocialUser } from '../types';
import { UserAvatar } from './UserAvatar';

type CommentListProps = {
  comments: SocialComment[];
  usersById: Record<string, SocialUser>;
  currentUserName?: string;
};

export function CommentList({ comments, usersById, currentUserName = 'Enes' }: CommentListProps) {
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

        return (
          <View key={comment.id} style={styles.item}>
            <UserAvatar uri={user?.avatarUrl} name={name} size={36} />
            <View style={styles.copy}>
              <View style={styles.header}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.time}>{comment.createdAt}</Text>
              </View>
              <Text style={styles.text}>{comment.text}</Text>
              <View style={styles.footer}>
                <Ionicons name="heart-outline" size={14} color={theme.colors.subtle} />
                <Text style={styles.footerText}>{comment.likes}</Text>
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
  name: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '900',
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
  footerText: {
    color: theme.colors.subtle,
    fontSize: 11,
    fontWeight: '800',
  },
  reply: {
    marginLeft: 8,
    color: theme.colors.primary,
    fontSize: 11,
    fontWeight: '900',
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
