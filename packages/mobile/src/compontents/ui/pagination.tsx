// pagination.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react-native';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  style?: any;
}

interface PaginationLinkProps {
  onPress?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
  style?: any;
}

const Pagination = ({ currentPage, totalPages, onPageChange, style }: PaginationProps) => {
  const pages = React.useMemo(() => {
    const pages = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('ellipsis');
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <View style={[styles.pagination, style]}>
      <PaginationPrevious
        onPress={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      />
      
      <View style={styles.content}>
        {pages.map((page, index) => {
          if (page === 'ellipsis') {
            return <PaginationEllipsis key={`ellipsis-${index}`} />;
          }
          
          return (
            <PaginationItem key={page}>
              <PaginationLink
                onPress={() => onPageChange(page as number)}
                isActive={currentPage === page}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          );
        })}
      </View>
      
      <PaginationNext
        onPress={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      />
    </View>
  );
};

const PaginationContent = ({ children, style }: any) => (
  <View style={[styles.content, style]}>{children}</View>
);

const PaginationItem = ({ children, style }: any) => (
  <View style={[styles.item, style]}>{children}</View>
);

const PaginationLink = ({ onPress, disabled, children, isActive, style }: PaginationLinkProps) => (
  <TouchableOpacity
    style={[
      styles.link,
      isActive && styles.linkActive,
      disabled && styles.linkDisabled,
      style,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    <Text style={[
      styles.linkText,
      isActive && styles.linkTextActive,
      disabled && styles.linkTextDisabled,
    ]}>
      {children}
    </Text>
  </TouchableOpacity>
);

const PaginationPrevious = ({ onPress, disabled, style }: any) => (
  <PaginationLink onPress={onPress} disabled={disabled} style={[styles.navLink, style]}>
    <ChevronLeft size={16} />
    <Text style={styles.navText}>Previous</Text>
  </PaginationLink>
);

const PaginationNext = ({ onPress, disabled, style }: any) => (
  <PaginationLink onPress={onPress} disabled={disabled} style={[styles.navLink, style]}>
    <Text style={styles.navText}>Next</Text>
    <ChevronRight size={16} />
  </PaginationLink>
);

const PaginationEllipsis = ({ style }: any) => (
  <View style={[styles.ellipsis, style]}>
    <MoreHorizontal size={16} color="#6b7280" />
  </View>
);

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  item: {
    // Container for pagination items
  },
  link: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  linkActive: {
    backgroundColor: 'white',
    borderColor: '#d1d5db',
  },
  linkDisabled: {
    opacity: 0.5,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  linkTextActive: {
    color: '#1f2937',
  },
  linkTextDisabled: {
    color: '#9ca3af',
  },
  navLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  ellipsis: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};