import {Anchor, AnchorProps} from '@mantine/core';
import {useCallback, useContext} from 'react';
import {Link, LinkProps} from 'react-router-dom';
import {RoutesContext, preloadRoute} from './routes';

type PreloadLinkProps = LinkProps & AnchorProps;

export const PreloadLink: React.FC<PreloadLinkProps> = (props) => {
  const routes = useContext(RoutesContext);
  const preload = useCallback(() => {
    if (routes) {
      preloadRoute(routes, props.to);
    }
  }, [routes]);
  return (
    <Anchor
      component={Link}
      onFocus={preload}
      onMouseEnter={preload}
      {...props}
    />
  );
};
